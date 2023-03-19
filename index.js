import TelegramBot from 'node-telegram-bot-api';
import { ChatGPTAPI } from 'chatgpt';

const GROUP_NAME = 'chat';
const TELEGRAM_BOT_TOKEN = '5831123456:AAXXXXXXXXXXXXXXXXXXXXXX-9ZHT4';
const API_KEY = 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxx';
const ALLOWED_USER_IDS = [12345678, 23456789, -1001234567, -911123456];
const TIMEOUT = 10 * 60 * 1000;
const PREFIX = GROUP_NAME ? new RegExp(`${GROUP_NAME}`) : /\/gpt/;
const UNAUTHORIZED_MSG = (userId) => `${userId} Unauthorized user.`;
const CLEARED_MSG = 'The conversation has been cleared.';
const WAITING_MSG = 'I am organizing my thoughts, please wait a moment.';
const ERROR_MSG = 'An error has occurred. Please try again later. If you are an administrator, please check the log.';

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const api = new ChatGPTAPI({ apiKey: API_KEY });
const messageIds = new Map();

bot.on('text', async ({ text, chat: { id: chatId }, message_id: messageId }) => {
  console.log(`${new Date().toLocaleString()} -- Received message from id: ${chatId}: ${text}`);
  await handleMessage({ text, chatId, messageId });
});

async function handleMessage({ text, chatId, messageId }) {
  if (typeof text !== 'string') return;

  if (!ALLOWED_USER_IDS.includes(chatId)) {
    await bot.sendMessage(chatId, UNAUTHORIZED_MSG(chatId));
    return;
  }

  if (text === '/reset') {
    messageIds.delete(chatId);
    await bot.sendMessage(chatId, CLEARED_MSG);
    return;
  }

  const [parentId = null, tempId = null] = (messageIds.get(chatId) ?? '').split(',');

  const [response, tempMessage] = await Promise.all([
    parentId ? api.sendMessage(text.replace(PREFIX, ''), { parentMessageId: parentId }) : api.sendMessage(text.replace(PREFIX, '')),
    bot.sendMessage(chatId, WAITING_MSG, { reply_to_message_id: messageId })
  ]);

  console.log(`${new Date().toLocaleString()} -- AI response to <${text}>: ${response.text}`);

  const newMsgId = `${response.id},${tempMessage.message_id}`;
  messageIds.set(chatId, newMsgId);

  await bot.editMessageText(response.text, { parse_mode: 'Markdown', chat_id: chatId, message_id: tempMessage.message_id });

  setTimeout(() => {
    messageIds.delete(chatId);
  }, TIMEOUT);
}
