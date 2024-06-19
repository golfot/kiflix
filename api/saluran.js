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
    const id = req.query.id || '';


    // Memeriksa apakah parameter slugs dan server telah diberikan
    if (!id) {
        res.status(400).json({ error: 'Parameter id saluran tidak ditemukan' });
        return;
    }

    const page = req.query.page !== undefined ? req.query.page : 1;
    
    let url = `${targetUrl}network/${id}/`;
    
    if (page !== 1) {
        url += `page/${page}/`;
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

            const articles = document.querySelectorAll('div[class="items full"] article');
            let results = [];

            articles.forEach(article => {
                const poster = article.querySelector('div[class="poster"] img') ? article.querySelector('div[class="poster"] img').getAttribute('src') : 'N/A';
                const title = article.querySelector('div[class="poster"] img') ? article.querySelector('div[class="poster"] img').getAttribute('alt') : 'N/A';
                let slug = article.querySelector('div[class="poster"] a') ? article.querySelector('div[class="poster"] a').getAttribute('href') : 'N/A';

                const type = slug.includes('/tvseries/') ? 'tv' : 'movie';
                
                // Menghapus bagian "https" dan domain dari slug menggunakan regex
                slug = slug.replace(/^https?:\/\/[^/]+/, '');
                
                // Menghapus simbol slash ('/') pertama dan terakhir dari slug
                slug = slug.replace(/^\/|\/$/g, '');
                

                
                results.push({
                    poster,
                    title,
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
