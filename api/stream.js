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

    // Mengambil nilai parameter slugs dari permintaan
    const slug = req.query.slug || '';

    // Memeriksa apakah parameter slugs telah diberikan
    if (!slug) {
        res.status(400).json({ error: 'Parameter slug tidak ditemukan' });
        return;
    }
    
    // Memisahkan slug menjadi array
    const slugArray = slug.split(',');

    // Menyiapkan array untuk menyimpan hasil dari setiap slug
    const results = [];

    // Loop melalui setiap slug dan ambil data dari server
    for (const slugs of slugArray) {
        const urls = [
            `${targetUrl}${slugs}/`,
            `${targetUrl}${slugs}/?player=2`,
            `${targetUrl}${slugs}/?player=3`,
            `${targetUrl}${slugs}/?player=4`
        ];

        // Siapkan array untuk menyimpan hasil berdasarkan urutan player
        const playerResults = Array(urls.length);

        const promises = urls.map((url, index) => {
            return new Promise((resolve, reject) => {
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

                        // Mengambil URL dari elemen iframe
                        const iframeElement = document.querySelector('iframe');
                        const urlstream = iframeElement ? iframeElement.getAttribute('src') : 'N/A';

                        // Menyimpan hasil ke dalam urutan yang benar berdasarkan indeks
                        playerResults[index] = {
                            name: `server ${index + 1}`,
                            urlstream
                        };

                        resolve();
                    });

                }).on('error', (err) => {
                    reject(err);
                });
            });
        });

        try {
            await Promise.all(promises);
            // Gabungkan hasil untuk setiap slug ke dalam `results`
            results.push(...playerResults);
        } catch (error) {
            res.status(500).json({ error: error.message });
            return;
        }
    }

    // Mengirim hasil sebagai respons
    res.status(200).json(results);
};
