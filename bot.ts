import { Bot } from "grammy";
import "dotenv/config";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

bot.command("start", (ctx) => ctx.reply("Add me to a group!"));

bot.on("my_chat_member", (ctx) =>
  ctx.reply("Hi yall! Looks like a group of winners.")
);

bot.start();
