const https = require('https');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const targetUrl = require('./targeturl');

module.exports = async (req, res) => {
    // Menambahkan header CORS ke dalam respons
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Mengatasi preflight request (OPTIONS)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Mengambil nilai parameter slugs dan server dari permintaan
    const slug = req.query.slug || '';


    // Memeriksa apakah parameter slugs dan server telah diberikan
    if (!slug) {
        res.status(400).json({ error: 'Parameter slug movies tidak ditemukan' });
        return;
    }

    let url = `${targetUrl}${slug}/`;

    https.get(url, (response) => {
        let data = '';

        // Mengumpulkan data yang diterima
        response.on('data', (chunk) => {
            data += chunk;
        });

        // Proses data setelah selesai diterima
        response.on('end', () => {
            const dom = new JSDOM(data);
            const document = dom.window.document;

            // Mengambil cover
            const coverElement = document.querySelector('img.cover');
            const cover = coverElement ? coverElement.getAttribute('src') : 'N/A';


            // Mengambil title
            const titleElement = document.querySelector('h1');
            const title = titleElement ? titleElement.textContent.trim() : 'N/A';


            // Membuat objek detail movie
            const detailMovieObject = {
                title,
                cover
            };

            res.status(200).json(detailMovieObject);
        });

    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
};
