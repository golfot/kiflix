const fetch = require('node-fetch');

const API_URL = 'https://chatgpt4online.org/wp-json/mwai-ui/v1/chats/submit';
const HEADERS = {
  'x-wp-nonce': '48b351b426',
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Redmi Note 7 Build/QKQ1.190910.002) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.188 Mobile Safari/537.36'
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const prompt = req.query.isi || 'hi';
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        botId: "chatbot-qm966k",
        customId: null,
        session: "N/A",
        chatId: "isrhak05sn8",
        contextId: 5410,
        messages: [
          {
            id: "tmc9m80fjrf",
            role: "user",
            content: prompt,
            who: "User: ",
            timestamp: Date.now()
          }
        ],
        newMessage: prompt,
        newFileId: null,
        stream: false
      })
    });

    const data = await response.json();
    const replyText = data.reply || 'No reply received';

    res.status(200).send(replyText);

  } catch (error) {
    res.status(500).send({ error: 'An error occurred' });
  }
};
