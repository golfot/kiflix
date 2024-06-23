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
        res.status(400).json({ error: 'Parameter slug tidak ditemukan' });
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

            const articles = document.querySelectorAll('div[id="single_relacionados"] article');
            let results = [];

            articles.forEach(article => {
                const poster = article.querySelector('img') ? article.querySelector('img').getAttribute('src') : 'N/A';
                const title = article.querySelector('img') ? article.querySelector('img').getAttribute('alt') : 'N/A';
                const rilis = article.querySelector('div[class="data"] span') ? article.querySelector('div[class="data"] span').textContent.trim() : 'N/A';
               
                let slug = article.querySelector('a') ? article.querySelector('a').getAttribute('href') : 'N/A';

                const type = slug.includes('/tvseries/') ? 'tv' : 'movie';
                
                // Menghapus bagian "https" dan domain dari slug menggunakan regex
                slug = slug.replace(/^https?:\/\/[^/]+/, '');
                
                // Menghapus simbol slash ('/') pertama dan terakhir dari slug
                slug = slug.replace(/^\/|\/$/g, '');
                

                
                results.push({
                    poster,
                    title,
                    rilis,
                    slug,
                    type
                });
            });

            res.status(200).json(results);
        });

    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
};
