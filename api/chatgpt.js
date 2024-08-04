const fetch = require('node-fetch');

// Fungsi untuk menghasilkan nilai acak untuk header 'x-vqd-4'
const generateVqd4Value = () => {
  // Ganti dengan logika untuk menghasilkan nilai acak yang sesuai
  return '4-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const DUCKDUCKGO_API_URL = 'https://duckduckgo.com/duckchat/v1/chat';

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
    const vqd4Value = generateVqd4Value(); // Dapatkan nilai acak untuk header

    const response = await fetch(DUCKDUCKGO_API_URL, {
      method: 'POST',
      headers: {
        'x-vqd-4': vqd4Value, // Gunakan nilai acak dalam header
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Redmi Note 7 Build/QKQ1.190910.002) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.188 Mobile Safari/537.36'
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    let resultText = '';
    response.body.on('data', (chunk) => {
      const chunkText = chunk.toString();
      // Extract messages from chunks and concatenate them
      const messages = chunkText.split('data: ').filter(data => data.trim() !== '[DONE]').map(data => {
        try {
          const parsed = JSON.parse(data);
          return parsed.message || '';
        } catch {
          return '';
        }
      }).join('');
      
      resultText += messages;
    });

    response.body.on('end', () => {
      res.status(200).send(resultText);
    });

  } catch (error) {
    res.status(500).send({ error: 'An error occurred' });
  }
};
