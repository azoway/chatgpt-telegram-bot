### 🔮ChatGPT Telegram Bot (by nodejs)

##### 部署
1. 准备工作
- Node.js版本 18+
- 登录[ChatGPT webapp](https://chat.openai.com/) 
- 获取[accessToken](https://chat.openai.com/api/auth/session)
- 申请[Telegram bot api token](https://t.me/BotFather)
  
2. 克隆项目，安装依赖
```bash
git clone https://github.com/azoway/telegpt
cd telegpt
npm install
```
  
3. 把准备的 Telegram bot api token 和 accessToken 对应写入 .env 文件
```bash
# 复制文件
cp .env.example .env

# 编辑 .env
cat <<EOF > .env
token='Your TelegramBot Token'
accessToken='登录 ChatGPT webapp 再访问 https://chat.openai.com/api/auth/session, 获取 accessToken 字段'
group_name = '群消息中需要回复的消息必须以该名称开头，如设置为'gpt'，那么群消息中必须以/gpt开头才会触发回复'
EOF
```
  
4. 启动
```bash
node index.js
#或者使用 pm2 （安装：npm i pm2 -g）
pm2 start index.js
``` 
  
##### 参考
* [hobk/chatgpt-telebot](https://github.com/hobk/chatgpt-telebot)
  
