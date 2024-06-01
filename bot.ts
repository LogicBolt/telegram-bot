import { Bot, InlineKeyboard } from "grammy";
import "dotenv/config";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

// Send a button
// bot.command("start", (ctx) => {
//   console.log(ctx.message?.message_id);

//   ctx.reply("a", {
//     reply_markup: new InlineKeyboard().webApp(
//     "Open Mini App",
//     "https://your-web-app.com"
//   ),
//   });
// });

bot.on("message", (ctx) => {
  console.log(ctx.chatId);
});

/* 
When added to a group the bot, it's creating a
new multisig, so it need to understand what's
the % of the group needs to agree to move funds
*/
bot.on("my_chat_member", (ctx) => {
  ctx.reply("Hi yall! Looks like a group of winners.");
  // TODO: create a new private key and account. Register current member number.
  console.log(ctx);
});

/* 
When a member of the DAO is added or remove,
we need to update the transaction threshold
*/
bot.on("chat_member", (ctx) => {
  ctx.reply("Hi new members, or maybe bye");
  // TODO keep track of groups members
  console.log(ctx);
});

bot.on("message_reaction", async (ctx) => {
  const { emoji, emojiAdded, emojiRemoved } = ctx.reactions();
  // new reaction
  if (emojiAdded.length != 0) {
    if (emojiAdded.includes("👍")) {
      // TODO: count for the specific proposal message
      console.log("Upvote for transaction");
      ctx.reply("Upvote registered");
    }
    // new reaction
  } else {
    if (emojiRemoved.includes("👍")) {
      // TODO: decrease for the specific proposal message
      console.log("Upvote lost for transaction");
    }
  }
});

bot.start({
  allowed_updates: ["message", "message_reaction", "message_reaction_count"],
});
