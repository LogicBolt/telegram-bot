import { Bot } from "grammy";
import "dotenv/config";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

const main = async () => {
  const message = await bot.api.sendMessage(
    -1002181151341,
    "The proposal is X"
  );
  console.log("proposal-receive - message id: ", message.message_id);
};

main();
