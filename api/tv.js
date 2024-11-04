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

    // Memastikan parameter slug diterima
    const slug = req.query.slug;
    if (!slug) {
        res.status(400).json({ error: 'Parameter slug tidak ditemukan' });
        return;
    }

    // URL target untuk mengambil data berdasarkan slug
    const url = `${targetUrl}${slug}/`;
  
    https.get(url, (response) => {
        let data = '';

        // Mengumpulkan data yang diterima
        response.on('data', (chunk) => {
            data += chunk;
        });

        // Memproses data setelah selesai diterima
        response.on('end', () => {
            const dom = new JSDOM(data);
            const document = dom.window.document;

            // Mengambil judul
            const title = document.querySelector('h1.entry-title') ? document.querySelector('h1.entry-title').textContent.trim() : 'N/A';

            // Mengambil sinopsis (paragraf pertama)
            const synopsis = document.querySelectorAll('p')[0] ? document.querySelectorAll('p')[0].textContent.trim() : 'N/A';

            // Mengambil detail film
            const details = {};
            const detailElements = document.querySelectorAll('div.gmr-moviedata');
            detailElements.forEach(detail => {
                const label = detail.querySelector('strong') ? detail.querySelector('strong').textContent.trim() : '';

                if (label === 'Genre:') {
                    details.genre = Array.from(detail.querySelectorAll('a')).map(a => a.textContent.trim());
                } else if (label === 'Quality:') {
                    details.quality = detail.querySelector('a') ? detail.querySelector('a').textContent.trim() : 'N/A';
                } else if (label === 'Year:') {
                    details.year = detail.querySelector('a') ? detail.querySelector('a').textContent.trim() : 'N/A';
                } else if (label === 'Duration:') {
                    details.duration = detail.querySelector('span[property="duration"]') ? detail.querySelector('span[property="duration"]').textContent.trim() : 'N/A';
                } else if (label === 'Country:') {
                    details.country = detail.querySelector('a') ? detail.querySelector('a').textContent.trim() : 'N/A';
                } else if (label === 'Release:') {
                    details.release = detail.querySelector('time') ? detail.querySelector('time').textContent.trim() : 'N/A';
                } else if (label === 'Director:') {
                    const director = detail.querySelector('span[itemprop="name"] a');
                    details.director = director ? { name: director.textContent.trim(), slug: director.href } : 'N/A';
                } else if (label === 'Cast:') {
                    details.cast = Array.from(detail.querySelectorAll('span[itemprop="actors"] a')).map(actor => ({
                        name: actor.textContent.trim(),
                        slug: actor.href
                    }));
                }
            });

            // Mengambil daftar episode
            const episodes = [];
            const episodeElements = document.querySelectorAll('div.gmr-listseries a.button.button-shadow:not(.active)');
            episodeElements.forEach(episode => {
                episodes.push({
                    episode: episode.textContent.trim(),
                    slug: episode.href
                });
            });

            // Mengirim respons JSON
            res.status(200).json({
                title,
                synopsis,
                details,
                episodes
            });
        });

    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
};
