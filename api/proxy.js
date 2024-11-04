const request = require('request');

export default function handler(req, res) {
    const { url } = req.query; // Mengambil URL dari query string

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    const options = {
        url: url,
        headers: {
            'Referer': 'https://vidhideplus.com/' // Ganti dengan referer yang diinginkan
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
