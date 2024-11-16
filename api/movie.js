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

    const movieSlug = req.query.slug || '';

    if (!movieSlug) {
        res.status(400).json({ error: 'Parameter slug tidak ditemukan' });
        return;
    }

    const url = `${targetUrl}${movieSlug}/`;

    https.get(url, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            const dom = new JSDOM(data);
            const document = dom.window.document;

            // Ambil judul film
            const title = document.querySelector('h1.entry-title') 
                ? document.querySelector('h1.entry-title').textContent.trim() 
                : 'N/A';

            // Ambil sinopsis
            const synopsis = document.querySelectorAll('p')[0]
                ? document.querySelectorAll('p')[0].textContent.trim()
                : 'N/A';

            // Ambil data detail film
            const details = {};
            const detailElements = document.querySelectorAll('div.gmr-moviedata');

            detailElements.forEach((element) => {
                const label = element.querySelector('strong') ? element.querySelector('strong').textContent.trim().toLowerCase().replace(':', '') : '';
                
                switch (label) {
                    case 'genre':
                        details.genre = Array.from(element.querySelectorAll('a')).map(genre => genre.textContent.trim());
                        break;
                    case 'quality':
                        details.quality = element.querySelector('a') ? element.querySelector('a').textContent.trim() : 'N/A';
                        break;
                    case 'year':
                        details.year = element.querySelector('a') ? element.querySelector('a').textContent.trim() : 'N/A';
                        break;
                    case 'duration':
                        details.duration = element.querySelector('span') ? element.querySelector('span').textContent.trim() : 'N/A';
                        break;
                    case 'country':
                        details.country = element.querySelector('a') ? element.querySelector('a').textContent.trim() : 'N/A';
                        break;
                    case 'release':
                        details.release = element.querySelector('time') ? element.querySelector('time').textContent.trim() : 'N/A';
                        break;
                    case 'director':
                        const directorElement = element.querySelector('span[itemprop="director"] a');
                        details.director = directorElement ? {
                            name: directorElement.textContent.trim(),
                            slug: directorElement.getAttribute('href')
                        } : { name: 'N/A', slug: 'N/A' };
                        break;
                    case 'cast':
                        details.cast = Array.from(element.querySelectorAll('span[itemprop="actors"] a')).map(cast => ({
                            name: cast.textContent.trim(),
                            slug: cast.getAttribute('href')
                        }));
                        break;
                    default:
                        break;
                }
            });

            // Ambil data film terkait
            const articles = document.querySelectorAll('article[class="item col-md-20"]');
            const movieterkait = [];

            articles.forEach((article) => {
                // Ambil URL poster dan hapus bagian '-152x228' jika ada
                let poster = article.querySelector('img') ? article.querySelector('img').getAttribute('src') : 'N/A';
                if (poster.includes('-152x228')) {
                    poster = poster.replace('-152x228', '');
                }

                const title = article.querySelector('h2') ? article.querySelector('h2').textContent.trim() : 'N/A';
                const tailer = article.querySelector('div.gmr-popup-button a') ? article.querySelector('div.gmr-popup-button a').getAttribute('href') : 'N/A';

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
                
                // Menambahkan data ke movieterkait
                movieterkait.push({
                    poster,
                    title,
                    tailer,
                    slug,
                    type,
                    episode
                });
            });

            res.status(200).json({
                title,
                synopsis,
                details,
                movieterkait
            });
        });
    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
};
