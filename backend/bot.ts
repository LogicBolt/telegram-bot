import { Bot, InlineKeyboard } from "grammy";
import "dotenv/config";
import { Database } from "./database";
import { messages } from "./messages";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
const db = new Database();

/* 
When added to a group the bot, it's creating a
new multisig, so it need to understand what's
the % of the group needs to agree to move funds
*/
bot.on("my_chat_member", async (ctx) => {
  ctx.reply(messages.joiningGroup);

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

  bot.api.sendMessage(author.user.id, messages.createProposal, {
    reply_markup: new InlineKeyboard().webApp(
      "Propose a transaction",
      // TODO: add chat id as query param
      "https://preview.daogram.0dns.co"
    ),
  });
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
  const proposal = dao.findProposal(ctx.messageReaction.message_id)!;

  // new reaction
  if (emojiAdded.length != 0) {
    if (emojiAdded.includes("👍")) {
      proposal.increaseUpvote();

      // Check if this makes the proposal approved
      if (dao.members >= dao.getApprovalThreshold()) {
        dao.executeProposal(proposal);
        bot.api.sendMessage(dao.chatId, messages.proposalExecuted);
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
