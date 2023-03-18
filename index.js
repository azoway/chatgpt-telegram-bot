import TelegramBot from 'node-telegram-bot-api'
import { ChatGPTAPI } from 'chatgpt'
import Redis from 'ioredis'

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

bot.on('text', async (msg) => {
  console.log(new Date().toLocaleString(), '--Received message from id:', msg.chat.id, ':', msg.text);
  await msgHandler(msg);
});

const client = new Redis({
  host: '127.0.0.1',
  port: 6379,
});

async function getMsgId(userid) {
  return new Promise((resolve, reject) => {
    client.get(userid, function(error, result) {
      if (error) {
        console.error(error);
        reject(error);
        return;
      }
      if (result === null || result.indexOf(",") == -1) {
        resolve("");
      } else {
        resolve(result);
      }
    });
  });
}

async function msgHandler(msg) {
  if (typeof msg.text !== 'string') {
    return;
  }
  
  if (!allowedUserIds.includes(msg.chat.id)) {
    await bot.sendMessage(msg.chat.id, msg.chat.id + ' Unauthorized user.');
    return;
  }

  const timeoutId = setTimeout(() => {
    client.del(msg.chat.id);
  }, 10 * 60 * 1000);
  
  switch (true) {
    case msg.text.startsWith('/reset'):
      client.del(msg.chat.id);
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
  const msgid = await getMsgId(msg.chat.id);
  var response = ""
  try {
    const tempId = (await bot.sendMessage(msg.chat.id, 'I am organizing my thoughts, please wait a moment.', {reply_to_message_id: msg.message_id})).message_id;
    bot.sendChatAction(msg.chat.id, 'typing');
    if (msgid.indexOf(",") != -1) {
      var parentid = msgid.split(',')[0]
      console.log(parentid);
      response = await api.sendMessage(msg.text.replace(prefix, ''),{ parentMessageId: parentid })
    } else {
      response = await api.sendMessage(msg.text.replace(prefix, ''))
    }
    console.log(new Date().toLocaleString(), '--AI response to <', msg.text, '>:', response.text);
    const newMsgId = response.id + ',' + tempId
    client.set(msg.chat.id, newMsgId);
    await bot.editMessageText(response.text, { parse_mode: 'Markdown', chat_id: msg.chat.id, message_id: tempId });
  } catch (err) {
    console.log('Error:', err)
    await bot.sendMessage(msg.chat.id, 'An error has occurred. Please try again later. If you are an administrator, please check the log.');
    throw err
  }
}
