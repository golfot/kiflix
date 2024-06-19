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

            const simponisElements = document.querySelectorAll('center p');
            const simponis = simponisElements.length > 1 ? simponisElements[1].textContent.trim() : 'N/A';
            
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

            // Ambil semua nama nomer season <span> dengan class "title"
            const titleElements = document.querySelectorAll('span[class="title"]');
            let seasontitle = [];

            titleElements.forEach(titleElement => {
             // Cek dan hapus elemen <i> yang mengandung tanggal
            const iElement = titleElement.querySelector('i');
            if (iElement) {
                const datePattern = /\d{2}\. [A-Za-z]{3}, \d{4}/; // Pola untuk tanggal dalam format "03. Sep, 2021"
                 if (datePattern.test(iElement.textContent)) {
                    titleElement.removeChild(iElement);
                 }
              }
            
              // Ambil teks title tanpa elemen rating
               const titleText = Array.from(titleElement.childNodes)
                    .filter(node => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'DIV'))
                    .map(node => node.textContent.trim())
                    .join(' ');

               seasontitle.push({
                  title: titleText
                });
            });
            
            

            // mengambil episode 
            
            const episodeElements = document.querySelectorAll('div[class="episodiotitle"] a');
            let episode = [];

            episodeElements.forEach(element => {
                    const title = element.textContent.trim();
      
                    let slug = element.getAttribute('href').trim();
                    // Menghapus bagian "https" dan domain dari slug menggunakan regex
                    slug = slug.replace(/^https?:\/\/[^/]+/, '');
                    // Menghapus simbol slash ('/') pertama dan terakhir dari slug
                    slug = slug.replace(/^\/|\/$/g, '');
                    episode.push({
                        title: title,
                        slug: slug
                    });
                
            });

             // Mengambil Poster
            const posterElement = document.querySelector('div[class="poster"] img[itemprop="image"]');
            const poster = posterElement ? posterElement.getAttribute('src') : 'N/A';

            // Mengambil title
            const titlesElement = document.querySelector('h1');
            const title = titlesElement ? titlesElement.textContent.trim() : 'N/A';


            // Membuat objek detail movie
            const detailMovieObject = {
                title,
                poster,
                simponis,
                genre,
                seasontitle,
                episode
            };

            res.status(200).json(detailMovieObject);
        });

    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
};
