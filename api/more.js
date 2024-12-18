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

    // Memeriksa apakah parameter yang dibutuhkan ada
    if (!req.query.year && !req.query.category && !req.query.country && !req.query.network) {
        res.status(400).json({ error: 'Parameter year, category, country, atau network tidak ditemukan' });
        return;
    }

    // Menentukan parameter apa yang digunakan
    const { year, category, country, network, page } = req.query;

    // Menambahkan logika untuk parameter page, default ke '/page/1/'
    const pageParam = page ? `/page/${page}/` : '/';

    let url1;

    // Menentukan URL berdasarkan parameter yang ada
    if (year) {
        url1 = `${targetUrl}year/${year}${pageParam}`;
    } else if (category) {
        url1 = `${targetUrl}category/${category}${pageParam}`;
    } else if (country) {
        url1 = `${targetUrl}country/${country}${pageParam}`;
    } else if (network) {
        url1 = `${targetUrl}network/${network}${pageParam}`;
    }

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
        // Memuat data dari URL yang sesuai dengan parameter yang diterima
        const dataPage1 = await fetchData(url1);

        // Mengirim respons JSON dengan data yang diterima
        res.status(200).json(dataPage1);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
