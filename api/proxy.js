const request = require('request');

export default function handler(req, res) {
    const { url } = req.query; // Mengambil URL dari query string

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    const options = {
        url: url,
        headers: {
            'Referer': 'https://viral.dutamovie21.cloud/', // Referer yang valid
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' // User-Agent yang umum
        }
    };

    request(options, (error, response, body) => {
        if (error) {
            return res.status(500).json({ error: 'Error fetching the video' });
        }
        res.setHeader('Content-Type', 'text/html'); // Atur tipe konten
        res.send(body); // Kirimkan konten ke klien
    });
}