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

            // Mengambil data simponis
            const simpinisElement = document.querySelector('div[itemprop="description"] p');
            const simponis = simpinisElement ? simpinisElement.textContent.trim() : 'N/A';

            // Mengambil semua data genre
            const genreElements = document.querySelectorAll('div[class="sgeneros"] a');
            let genre = [];

            genreElements.forEach(element => {
                    const title = element.textContent.trim();
      
                    let slug = element.getAttribute('href').trim();
                    // Menghapus bagian "https" dan domain dari slug menggunakan regex
                    slug = slug.replace(/^https?:\/\/[^/]+/, '');
                    // Menghapus simbol slash ('/') pertama dan terakhir dari slug
                    slug = slug.replace(/^\/|\/$/g, '');
                    genre.push({
                        title: title,
                        slug: slug
                    });
                
            });

            const castElements = document.querySelectorAll('div[class="person"]');
            let cast = [];

            castElements.forEach(element => {
                    const caracter = element.querySelector('div.caracter') ? element.querySelector('div.caracter').textContent.trim() : 'N/A';
                    const thumb = element.querySelector('img') ? element.querySelector('img').getAttribute('src') : 'N/A';
                    const title = element.querySelector('img') ? element.querySelector('img').getAttribute('alt') : 'N/A';
               

                
                    let slug = element.querySelector('div.name a') ? element.querySelector('div.name a').getAttribute('href') : 'N/A';
                    // Menghapus bagian "https" dan domain dari slug menggunakan regex
                    slug = slug.replace(/^https?:\/\/[^/]+/, '');
                    // Menghapus simbol slash ('/') pertama dan terakhir dari slug
                    slug = slug.replace(/^\/|\/$/g, '');
                    cast.push({
                        title: title,
                        caracter: caracter,
                        thumb: thumb,
                        slug: slug
                    });
                
            });

            // Mengambil durasi
            const iframeElement = document.querySelector('span[class="runtime"]');
            const durasi = iframeElement ? iframeElement.textContent.trim() : 'N/A';

            // Mengambil Poster
            const posterElement = document.querySelector('div[class="poster"] img[itemprop="image"]');
            const poster = posterElement ? posterElement.getAttribute('src') : 'N/A';


            // Mengambil title
            const titleElement = document.querySelector('h1');
            const title = titleElement ? titleElement.textContent.trim() : 'N/A';


            // Membuat objek detail movie
            const detailMovieObject = {
                title,
                poster,
                simponis,
                durasi,
                cast,
                genre
            };

            res.status(200).json(detailMovieObject);
        });

    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
};
