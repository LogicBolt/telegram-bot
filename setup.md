# DAOgram Setup Guide

## What is DAOgram?

DAOgram is a Telegram-based DAO (Decentralized Autonomous Organization) governance system that allows groups to:
- Create proposals for spending TON cryptocurrency
- Vote on proposals using Telegram reactions (👍)
- Automatically execute approved proposals on the TON blockchain

## Project Structure

- `backend/` - Telegram bot and socket server
- `daogram-mini-app/` - Web interface for creating proposals

## Setup Instructions

### 1. Create a Telegram Bot

1. Message @BotFather on Telegram
2. Send `/newbot`
3. Follow instructions to create your bot
4. Copy the bot token

### 2. Configure Environment

Create a `.env` file in the `backend/` directory:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
MASTER_SEED_PHRASE=term client despair will cheese jar weapon adapt forum story ranch where sign cup juice burden armor mom impact shoulder cloud mercy advance write
PORT=3001
```

The server uses Let's Encrypt certificates from `/etc/letsencrypt/live/commonwealthsovereignfoundation.org/`

### 3. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Mini-app dependencies  
cd ../daogram-mini-app
npm install
```

### 4. Start the Services

```bash
# Terminal 1: Start socket server and bot
cd backend
npm run dev

# Terminal 2: Start mini-app
cd daogram-mini-app
npm run dev
```

### 5. Configure Mini-App URL

1. Go to @BotFather
2. Send `/setmenubutton`
3. Select your bot
4. Set the menu button URL to: `https://daogram.commonwealthsovereignfoundation.org`

## How It Works

1. **Add bot to group** → Creates multisig wallet for the group
2. **Type `/propose`** → Bot sends DM with button to open mini-app
3. **Fill proposal form** → Mini-app sends data to local socket server
4. **Bot posts proposal** → Proposal appears in group with voting instructions
5. **Members vote with 👍** → When threshold reached, transaction executes on TON

## Deployment

The project is now configured for your domain:
- Backend: `https://commonwealthsovereignfoundation.org`
- Frontend: `https://daogram.commonwealthsovereignfoundation.org`

To deploy:
1. Deploy the backend to your server with SSL certificates
2. Deploy the mini-app to your subdomain
3. Ensure both services are accessible via HTTPS

## Security Notes

- The master seed phrase controls all multisig wallets
- Keep it secure and never share it
- Consider using environment variables for production
- The approval threshold is 49% of group members

## Troubleshooting

- Make sure all services are running on the correct ports
- Check that your bot token is valid
- Ensure the mini-app URL is accessible from Telegram
- Verify TON network connectivity for blockchain operations 