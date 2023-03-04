import * as dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'
import { ChatGPTUnofficialProxyAPI } from 'chatgpt'

dotenv.config()

const { token, accessToken, group_name } = process.env
const prefix = group_name ? '/' + group_name : '/gpt'
const bot = new TelegramBot(token, { polling: true });
console.log(new Date().toLocaleString(), '--Bot has been started...');

const api = new ChatGPTUnofficialProxyAPI({
  accessToken,
  apiReverseProxyUrl: 'https://chat.duti.tech/api/conversation'
})

bot.on('text', async (msg) => {
  console.log(new Date().toLocaleString(), '--Received message from id:', msg.chat.id, ':', msg.text);
  await msgHandler(msg);
});

async function msgHandler(msg) {
  if (typeof msg.text !== 'string' || ((msg.chat.type === 'group' || msg.chat.type === 'supergroup') && !msg.text.startsWith(prefix))) {
    return;
  }
  switch (true) {
    case msg.text.startsWith('/start'):
      await bot.sendMessage(msg.chat.id, '你好~开始探索吧~~');
      break;
    case msg.text.length >= 2:
      await chatGpt(msg);
      break;
    default:
      await bot.sendMessage(msg.chat.id, '我不太明白您的意思~~');
      break;
  }
}

async function chatGpt(msg) {
  try {
    const tempId = (await bot.sendMessage(msg.chat.id, '正在组织语言，请稍等~~', {
      reply_to_message_id: msg.message_id
    })).message_id;
    bot.sendChatAction(msg.chat.id, 'typing');
    const response = await api.sendMessage(msg.text.replace(prefix, ''))
    console.log(new Date().toLocaleString(), '--AI response to <', msg.text, '>:', response.text);
    await bot.editMessageText(response.text, { parse_mode: 'Markdown', chat_id: msg.chat.id, message_id: tempId });
  } catch (err) {
    console.log('Error:', err)
    await bot.sendMessage(msg.chat.id, '出错了，请稍后再试；如果您是管理员，请检查日志~~');
    throw err
  }
}
