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

    const currentYear = new Date().getFullYear();
    const url1 = `${targetUrl}year/${currentYear}/`;
    const url2 = `${targetUrl}year/${currentYear}/page/2/`;
    const url3 = `${targetUrl}year/${currentYear}/page/3/`;  // Menambahkan halaman ketiga

    // Menentukan filter type dari query parameter
    const filterType = req.query.type; // Nilainya bisa 'movie', 'tv', atau undefined

    // Fungsi untuk mengambil data dari URL tertentu
    const fetchData = (url) => {
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

                    const articles = document.querySelectorAll('article');
                    let results = [];

                    articles.forEach(article => {
                        // Ambil URL poster dan hapus bagian '-152x228' jika ada
                        let poster = article.querySelector('img') ? article.querySelector('img').getAttribute('src') : 'N/A';
                        if (poster.includes('-152x228')) {
                            poster = poster.replace('-152x228', '');
                        }

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
                        
                        // Menambahkan data ke results hanya jika type sesuai filterType
                        if (!filterType || type === filterType) {
                            results.push({
                                poster,
                                title,
                                tailer,
                                slug,
                                type,
                                episode
                            });
                        }
                    });

                    resolve(results);
                });

            }).on('error', (err) => {
                reject(err);
            });
        });
    };

    try {
        // Memuat data dari ketiga halaman
        const [dataPage1, dataPage2, dataPage3] = await Promise.all([fetchData(url1), fetchData(url2), fetchData(url3)]);
        
        // Menggabungkan data dari ketiga halaman
        const combinedResults = [...dataPage1, ...dataPage2, ...dataPage3];

        // Mengirim respons JSON dengan data yang digabungkan
        res.status(200).json(combinedResults);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
