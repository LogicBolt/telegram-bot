import { Bot, InlineKeyboard } from "grammy";
import "dotenv/config";
import { Database } from "./database";
import { messages } from "./messages";
import { io } from "socket.io-client";
import { createWallet } from "./onchain";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
const db = new Database();
const socket = io("https://socket.daogram.0dns.co/");

/*
When added to a group the bot, it's creating a
new multisig, so it need to understand what's
the % of the group needs to agree to move funds
*/
bot.on("my_chat_member", async (ctx) => {
  if (ctx.update.my_chat_member.new_chat_member.status !== "member") {
    return;
  }

  // console.log("my_chat_member:myChatMember: ", ctx.myChatMember);
  console.log("my_chat_member:chatId: ", ctx.chatId);
  // console.log("my_chat_member:membersNumber: ", await ctx.getChatMemberCount());
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
      // TODO: add chat id as query param
      `https://preview.daogram.0dns.co/#submit-proposal?chat-id=${ctx.chatId}`
    ),
  }).catch(e => {
    console.error(e.message);
  });
});

/* 
Receives data from webapp after submitting proposal
*/
socket.on("proposal", async (proposal) => {
  console.log("Received proposal: ", proposal);

  const message = await bot.api.sendMessage(
    proposal.chatId,
    messages.proposalTemplate
      .replace("$DESCRIPTION", proposal.description)
      .replace("$AMOUNT", proposal.amount)
      .replace("$DESTINATION_ADDRESS", proposal.destinationAddress)
  );

  const dao = db.findDAO(proposal.chatId)!;
  dao.createNewProposal(message.message_id, proposal);
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

  // TODO: When member leave, recalcuate proposals approval
});

/* 
A proposal voting happens through reactions.
When the threshold is reached, the bot executes.
*/
bot.on("message_reaction", async (ctx) => {
  const { emojiAdded, emojiRemoved } = ctx.reactions();

  const dao = db.findDAO(ctx.chatId)!;
  if (!dao) {
    return;
  }
  const proposal = dao.findProposal(ctx.messageReaction.message_id)!;
  if (proposal.executed) return;

  console.log("PROPOSAL FROM REACTION: ", proposal, dao);
  // new reaction
  if (emojiAdded.length != 0) {
    if (emojiAdded.includes("👍")) {
      proposal.increaseUpvote();

      // Check if this makes the proposal approved
      if (proposal.upvotes >= dao.getApprovalThreshold()) {
        const tx = await dao.executeProposal(proposal).catch(e => {
          console.error('Execute Proposal failed');
          console.log(e);
          return null;
        });
        if (tx) {
          console.log("EXECUTED: ", tx);
          bot.api.sendMessage(dao.chatId, messages.proposalExecuted, {
            reply_parameters: { message_id: proposal.messageId },
          });
        } else {
          bot.api.sendMessage(dao.chatId, messages.transactionError, {
            reply_parameters: { message_id: proposal.messageId },
          });
        }
      }
    }
  } else {
    // removing upvote
    if (emojiRemoved.includes("👍")) {
      proposal?.decreaseUpvote();
    }
  }
});

bot.start({
  allowed_updates: ["message", "message_reaction", "my_chat_member"],
});
