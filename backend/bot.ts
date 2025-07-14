import { Bot, InlineKeyboard } from "grammy";
import "dotenv/config";
import { Database } from "./database";
import { messages } from "./messages";
import { createWallet } from "./onchain";
import { createServer } from 'https';
import express from 'express';
import cors from 'cors';
import fs from 'fs';

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
const db = new Database();

// Create Express app and HTTPS server
const app = express();
const server = createServer({
  key: fs.readFileSync("/etc/letsencrypt/live/commonwealthsovereignfoundation.org/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/commonwealthsovereignfoundation.org/fullchain.pem"),
}, app);

app.use(cors());
app.use(express.json());

// bot.start({
//   allowed_updates: ["message", "message_reaction", "my_chat_member"],
// });
console.log("✅ Bot started successfully");

// Start the HTTPS server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🌐 HTTPS server running on port ${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   GET  https://commonwealthsovereignfoundation.org:${PORT}/ - Health check`);
  console.log(`   POST https://commonwealthsovereignfoundation.org:${PORT}/ - Submit proposal`);
});

// Simple health check endpoint
app.get('/', (req: any, res: any) => {
  res.json({
    status: 'OK',
    message: 'DAOgram bot server is running',
    timestamp: new Date().toISOString()
  });
});

/*
When added to a group the bot, it's creating a
new multisig, so it need to understand what's
the % of the group needs to agree to move funds
*/
bot.on("my_chat_member", async (ctx) => {
  if (ctx.update.my_chat_member.new_chat_member.status !== "member") {
    return;
  }

  console.log("my_chat_member:chatId: ", ctx.chatId);
  try {
    const embeddedWallet = await createWallet(ctx.chatId);
    await ctx.reply(
      messages.joiningGroup
        .replace(
          "$DAO_MULTISIG_ADDRESS",
          embeddedWallet.address.toString(true, true, false, true)
        )
        .replace(
          "$DAO_MULTISIG_ADDRESS",
          embeddedWallet.address.toString(true, true, false, true)
        ),
      { parse_mode: "MarkdownV2" }
    );
    db.createNewDAO(ctx.chatId, await ctx.getChatMemberCount(), embeddedWallet);
  } catch (e: unknown) {
    console.error(e);
  }
});

/* 
For proposing a new transaction on the group, 
a user should sent /propose, then the bot will reachout
in the DM to send a button for starting the mini webapp.
*/
bot.command("propose", async (ctx) => {
  const author = await ctx.getAuthor();
  const dao = db.findDAO(ctx.chatId);

  if (dao == undefined) {
    const embeddedWallet = await createWallet(ctx.chatId);
    db.createNewDAO(ctx.chatId, await ctx.getChatMemberCount(), embeddedWallet);
  }

  await bot.api.sendMessage(author.user.id, messages.createProposal, {
    reply_markup: new InlineKeyboard().webApp(
      messages.createProposalButton,
      `https://daogram.commonwealthsovereignfoundation.org/#submit-proposal?chat-id=${ctx.chatId}`
    ),
  }).catch(e => {
    console.error(e.message);
  });
});

// Handle proposal submissions from mini-app via HTTP POST
app.post('/', async (req: any, res: any) => {
  console.log('Received POST request:', req.body);

  const { chatId, description, amount, destinationAddress } = req.body;

  if (!chatId || !description || !amount || !destinationAddress) {
    console.error('Missing required fields:', { chatId, description, amount, destinationAddress });
    return res.status(400).json({
      error: 'Missing required fields: chatId, description, amount, destinationAddress'
    });
  }

  console.log('Processing proposal:', { chatId, description, amount, destinationAddress });

  try {
    const message = await bot.api.sendMessage(
      chatId,
      messages.proposalTemplate
        .replace("$DESCRIPTION", description)
        .replace("$AMOUNT", amount)
        .replace("$DESTINATION_ADDRESS", destinationAddress)
    );

    const dao = db.findDAO(chatId);
    if (dao) {
      dao.createNewProposal(message.message_id, { description, amount, destinationAddress });
      console.log('✅ Proposal created successfully for chat:', chatId, 'Message ID:', message.message_id);
      res.json({
        success: true,
        messageId: message.message_id,
        message: 'Proposal posted successfully'
      });
    } else {
      console.error('DAO not found for chat:', chatId);
      res.status(404).json({ error: 'DAO not found for this chat' });
    }
  } catch (error) {
    console.error('Error processing proposal:', error);
    res.status(500).json({ error: 'Failed to process proposal', details: error });
  }
});

/* 
When a member of the DAO is added or remove,
we need to update members
*/
bot.on("chat_member", async (ctx) => {
  console.log(
    "chat_member:username: ",
    ctx.chatMember.new_chat_member.user.username
  );

  const dao = db.findDAO(ctx.chatId)!;
  dao.updateMembers(await ctx.getChatMemberCount());
});

/* 
A proposal voting happens through reactions.
When the threshold is reached, the bot executes.
*/
bot.on("message_reaction", async (ctx) => {
  console.log("🎯 REACTION EVENT RECEIVED");
  console.log("Chat ID:", ctx.chatId);
  console.log("Message ID:", ctx.messageReaction.message_id);
  console.log("User ID:", ctx.messageReaction.user?.id || "Unknown");

  const { emojiAdded, emojiRemoved } = ctx.reactions();
  console.log("👍 Emoji Added:", emojiAdded);
  console.log("👎 Emoji Removed:", emojiRemoved);

  const dao = db.findDAO(ctx.chatId);
  if (!dao) {
    console.log("❌ No DAO found for chat:", ctx.chatId);
    return;
  }

  const proposal = dao.findProposal(ctx.messageReaction.message_id);
  if (!proposal) {
    console.log("❌ No proposal found for message ID:", ctx.messageReaction.message_id);
    console.log("Available proposals:", dao.proposals?.map(p => ({ messageId: p.messageId, description: p.description })) || []);
    return;
  }

  if (proposal.executed) {
    console.log("❌ Proposal already executed");
    return;
  }

  console.log("📊 Current proposal state:", {
    messageId: proposal.messageId,
    upvotes: proposal.upvotes,
    threshold: dao.getApprovalThreshold(),
    description: proposal.description
  });

  // Handle new reactions
  if (emojiAdded.length > 0) {
    if (emojiAdded.includes("👍")) {
      proposal.increaseUpvote();
      console.log("✅ Upvote added! New count:", proposal.upvotes);

      // Check if this makes the proposal approved
      if (proposal.upvotes >= dao.getApprovalThreshold()) {
        console.log("🎉 PROPOSAL APPROVED! Executing transaction...");
        const tx = await dao.executeProposal(proposal).catch((e: any) => {
          console.error('❌ Execute Proposal failed:', e);
          return null;
        });
        if (tx) {
          console.log("✅ Transaction executed successfully:", tx);
          await bot.api.sendMessage(dao.chatId, messages.proposalExecuted, {
            reply_parameters: { message_id: proposal.messageId },
          });
        } else {
          console.log("❌ Transaction failed");
          await bot.api.sendMessage(dao.chatId, messages.transactionError, {
            reply_parameters: { message_id: proposal.messageId },
          });
        }
      } else {
        console.log("📊 Not enough votes yet. Need:", dao.getApprovalThreshold() - proposal.upvotes, "more");
      }
    }
  }

  // Handle removed reactions
  if (emojiRemoved.length > 0) {
    if (emojiRemoved.includes("👍")) {
      proposal.decreaseUpvote();
      console.log("👎 Upvote removed! New count:", proposal.upvotes);
    }
  }
});

// Start both the bot and the HTTPS server
async function startServer() {
  try {
    // Start the bot
    await bot.start({
      allowed_updates: ["message", "message_reaction", "my_chat_member"],
    });
    console.log("✅ Bot started successfully");

    // Start the HTTPS server
    // const PORT = process.env.PORT || 3001;
    // server.listen(PORT, () => {
    //   console.log(`🌐 HTTPS server running on port ${PORT}`);
    //   console.log(`📡 Endpoints:`);
    //   console.log(`   GET  https://commonwealthsovereignfoundation.org:${PORT}/ - Health check`);
    //   console.log(`   POST https://commonwealthsovereignfoundation.org:${PORT}/ - Submit proposal`);
    // });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
}

startServer();
