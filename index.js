import TelegramBot from 'node-telegram-bot-api'
import { ChatGPTAPI } from 'chatgpt'

//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓EDIT_EDIT_EDIT↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
const group_name = 'chat'
const telegram_bot_token='5831123456:AAXXXXXXXXXXXXXXXXXXXXXX-9ZHT4'
const apiKey='sk-xxxxxxxxxxxxxxxxxxxxxxxxxx'
const allowedUserIds = [12345678, 23456789, -1001234567, -911123456];
//↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑EDIT_EDIT_EDIT↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

const prefix = group_name ? '/' + group_name : '/gpt'
const bot = new TelegramBot(telegram_bot_token, { polling: true });
console.log(new Date().toLocaleString(), '--Bot has been started...');

const api = new ChatGPTAPI({ apiKey })
const messageIds = new Map();

bot.on('text', async (msg) => {
  console.log(new Date().toLocaleString(), '--Received message from id:', msg.chat.id, ':', msg.text);
  await msgHandler(msg);
});

async function msgHandler(msg) {
  if (typeof msg.text !== 'string') {
    return;
  }
  
  if (!allowedUserIds.includes(msg.chat.id)) {
    await bot.sendMessage(msg.chat.id, msg.chat.id + ' Unauthorized user.');
    return;
  }

  const timeoutId = setTimeout(() => {
    messageIds.delete(msg.chat.id);
  }, 10 * 60 * 1000);
  
  switch (true) {
    case msg.text.startsWith('/reset'):
      messageIds.delete(msg.chat.id);
      await bot.sendMessage(msg.chat.id, 'The conversation has been cleared.');
      break;
    case msg.text.length >= 2:
      await chatGpt(msg);
      break;
    default:
      await bot.sendMessage(msg.chat.id, 'I am not quite sure what you mean.');
      break;
  }
}

async function chatGpt(msg) {
  const msgid = messageIds.get(msg.chat.id) ?? "";
  var response = ""
  try {
    const tempMessage = await bot.sendMessage(msg.chat.id, 'I am organizing my thoughts, please wait a moment.', {reply_to_message_id: msg.message_id});
    const tempId = tempMessage.message_id;
    bot.sendChatAction(msg.chat.id, 'typing');
    if (msgid.includes(",")) {
      var parentid = msgid.split(',')[0]
      console.log(parentid);
      response = await api.sendMessage(msg.text.replace(prefix, ''),{ parentMessageId: parentid })
    } else {
      response = await api.sendMessage(msg.text.replace(prefix, ''))
    }
    console.log(new Date().toLocaleString(), '--AI response to <', msg.text, '>:', response.text);
    const newMsgId = response.id + ',' + tempId
    messageIds.set(msg.chat.id, newMsgId);
    await bot.editMessageText(response.text, { parse_mode: 'Markdown', chat_id: msg.chat.id, message_id: tempId });
  } catch (err) {
    console.log('Error:', err)
    await bot.sendMessage(msg.chat.id, 'An error has occurred. Please try again later. If you are an administrator, please check the log.');
    throw err
  }
}