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

            res.status(200).json({
                title,
                synopsis,
                details
            });
        });
    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
};
