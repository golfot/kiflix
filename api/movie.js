const fetch = require('node-fetch');

const API_URL = 'https://chatgpt.org.ua/api/?action=check_answer';
const HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
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
    const prompt = req.query.cek || '';
     const body = `question_hash=${encodeURIComponent(prompt)}&bfp_hash=277174405&lang=en`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: HEADERS,
      body
    });

    const data = await response.json();
    const replyData = data.answer_text || 'Bot tidak bisa mengecek pesan ini';

    res.status(200).send(replyData);

  } catch (error) {
    res.status(500).send({ error: 'An error occurred' });
  }
};
