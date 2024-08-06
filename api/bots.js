const fetch = require('node-fetch');

const PESAN_API_URL = 'https://kiflix.vercel.app/api/pesan';
const CEK_PESAN_API_URL = 'https://kiflix.vercel.app/api/cekpesan';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const isipesan = req.query.isipesan || '';

      if (!isipesan) {
        res.status(400).json({ error: 'Parameter "isipesan" is required' });
        return;
      }

      // Kirim pesan
      const pesanResponse = await fetch(`${PESAN_API_URL}?isipesan=${encodeURIComponent(isipesan)}`);
      const pesanText = await pesanResponse.text(); // Mengambil respons sebagai teks

      // Jika tidak ada teks dari respons pesan, tangani kesalahan
      if (!pesanText) {
        res.status(500).json({ error: 'Failed to get response from PESAN_API_URL' });
        return;
      }

      // Cek pesan
      const cekResponse = await fetch(`${CEK_PESAN_API_URL}?cek=${pesanText}`);
      const cekhasilnya = await cekResponse.text(); // Mengambil respons sebagai teks

      res.status(200).send(cekhasilnya);

    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
