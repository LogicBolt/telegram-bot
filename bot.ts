import { Bot, InlineKeyboard } from "grammy";
import "dotenv/config";
import { Database } from "./database";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
const db = new Database();
/* 
When added to a group the bot, it's creating a
new multisig, so it need to understand what's
the % of the group needs to agree to move funds
*/
bot.on("my_chat_member", async (ctx) => {
  ctx.reply("Hi yall! Looks like a group of winners.");
  // TODO: create a new private key and account. Register current chat number.
  console.log("my_chat_member:myChatMember: ", ctx.myChatMember);
  console.log("my_chat_member:chatId: ", ctx.chatId);
  console.log("my_chat_member:membersNumber: ", await ctx.getChatMemberCount());
  db.createNewDAO(ctx.chatId, await ctx.getChatMemberCount());
});

/* 
For proposing a new transaction on the group, 
a user should sent /propose, then the bot will reachout
in the DM to send a button for starting the mini webapp.
*/
bot.command("propose", async (ctx) => {
  const author = await ctx.getAuthor();

  bot.api.sendMessage(author.user.id, "Hi!", {
    reply_markup: new InlineKeyboard().webApp(
      "Propose a transaction",
      // TODO: add chat id as query param
      "https://preview.daogram.0dns.co"
    ),
  });
});

bot.on("message", async (ctx) => {
  console.log("message:chatId: ", ctx.chatId);
  console.log("message:membersNumber: ", await ctx.getChatMemberCount());
});

/* 
When a member of the DAO is added or remove,
we need to update members
*/
bot.on("chat_member", async (ctx) => {
  ctx.reply("Hi new members, or maybe bye");

  console.log(ctx);
  const dao = db.findDAO(ctx.chatId)!;
  dao.updateMembers(await ctx.getChatMemberCount());
});

bot.on("message_reaction", async (ctx) => {
  const { emojiAdded, emojiRemoved } = ctx.reactions();

  const dao = db.findDAO(ctx.chatId)!;
  const proposal = dao.findProposal(ctx.messageReaction.message_id)!;

  // new reaction
  if (emojiAdded.length != 0) {
    if (emojiAdded.includes("👍")) {
      const currentApproval = proposal.increaseUpvote();

      if (currentApproval >= dao!.getApprovalThreshold()) {
        dao!.executeProposal(proposal!);
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
