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
    
    // Mengambil nilai parameter categori, country, dan genre dari permintaan
    const categori = req.query.categori || '';
    const country = req.query.country || '';
    const genre = req.query.genre || '';

    // Memeriksa apakah salah satu dari parameter telah diberikan
    if (!categori && !country && !genre) {
        res.status(400).json({ error: 'Parameter kategori, country, atau genre tidak ditemukan' });
        return;
    }

    // Tentukan URL berdasarkan parameter yang diberikan
    let url = '';
    if (categori) {
        url = `${targetUrl}category/${categori}/`;
    } else if (country) {
        url = `${targetUrl}country/${country}/`;
    } else if (genre) {
        url = `${targetUrl}genre/${genre}/`;
    }

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

            const articles = document.querySelectorAll('article');
            let results = [];

            articles.forEach(article => {
                const poster = article.querySelector('img') ? article.querySelector('img').getAttribute('src') : 'N/A';
                const title = article.querySelector('h2') ? article.querySelector('h2').textContent.trim() : 'N/A';
                const tailer = article.querySelector('article div.gmr-popup-button a') ? article.querySelector('article div.gmr-popup-button a').getAttribute('href') : 'N/A';

                let slug = article.querySelector('div.item-article h2 a') ? article.querySelector('div.item-article h2 a').getAttribute('href') : 'N/A';

                const type = slug.includes('/tv/') ? 'tv' : 'movie';

                // Mengatur nilai episode
                const episode = type === 'tv' 
                    ? (article.querySelector('div.gmr-numbeps') ? article.querySelector('div.gmr-numbeps').textContent.trim() : 'N/A')
                    : 'N/A';

                // Menghapus bagian "https" dan domain dari slug menggunakan regex
                slug = slug.replace(/^https?:\/\/[^/]+/, '');
                
                // Menghapus simbol slash ('/') pertama dan terakhir dari slug
                slug = slug.replace(/^\/|\/$/g, '');
                
                results.push({
                    poster,
                    title,
                    tailer,
                    slug,
                    type,
                    episode
                });
            });

            res.status(200).json(results);
        });

    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
};
