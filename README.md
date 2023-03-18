#### 🔮 ChatGPT Telegram Bot by nodejs  
This is a nodejs code for creating a Telegram bot that uses the ChatGPT API to generate responses to user messages.
  
###### Installation:  
  
```bash
git clone https://github.com/azoway/chatgpt-telegram-bot
cd chatgpt-telegram-bot
npm install
vim index.js
node index.js
``` 
  
###### Usage:  
1. Obtain a Telegram bot token from BotFather and replace the value of telegram_bot_token with your token.
2. Obtain an API key for the ChatGPT API and replace the value of apiKey with your key.
3. Optionally, change the group_name variable to specify a different name for your bot's command prefix (default is /gpt).
4. Modify the allowedUserIds array to include the IDs of the Telegram users and groups that are allowed to interact with your bot.
5. Start Redis on your local machine or remote server and update the connection settings in the client variable if necessary.
6. Run the following command to start the bot: `node index.js`
7. Send a message to your bot in Telegram to initiate a conversation. You can use the /reset command to clear the conversation history and start over.
  
