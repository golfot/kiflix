const fetch = require('node-fetch');

// Fungsi untuk menghasilkan token klien dengan perubahan satu huruf
const generateRandomClientToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomChar = chars.charAt(Math.floor(Math.random() * chars.length));
  return `UljdP0yvivhhi2m${randomChar}D20e4X5kEXntvyWJ`;
};

// URL API dan headers
const API_URL_ADD = 'https://chatgpt.org.ua/api/?action=add_question';
const API_URL_CHECK = 'https://chatgpt.org.ua/api/?action=check_answer';
const HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Redmi Note 7 Build/QKQ1.190910.002) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.188 Mobile Safari/537.36'
};

// Fungsi utama untuk menangani proses API
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
    const randomIP = generateRandomIP();
    const randomClientToken = generateRandomClientToken();
    const bodyAdd = `question=${encodeURIComponent(prompt)}&bfp_hash=277174405&ip=103.30.11.154&client_token=${randomClientToken}`;

    // Panggilan API pertama ke add_question
    const responseAdd = await fetch(API_URL_ADD, {
      method: 'POST',
      headers: HEADERS,
      body: bodyAdd
    });

    const dataAdd = await responseAdd.json();
    const questionHash = dataAdd.data;

    // Persiapkan body untuk API check_answer dengan IP yang sama
    const bodyCheck = `question_hash=${questionHash}&bfp_hash=277174405&ip=103.30.11.154&lang=en`;

    // Panggilan API kedua ke check_answer
    const responseCheck = await fetch(API_URL_CHECK, {
      method: 'POST',
      headers: HEADERS,
      body: bodyCheck
    });

    const dataCheck = await responseCheck.json();

    const answerText = dataCheck.data.answer_text;

    // Kirim jawaban kembali ke klien
    res.status(200).json({ answer: answerText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
