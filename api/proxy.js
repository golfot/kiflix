const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { url } = req.query;

    // Validasi URL
    if (!url) {
        return res.status(400).send("Parameter 'url' is required.");
    }

    try {
        // Fetch konten dari URL target dengan referer kustom
        const response = await fetch(url, {
            headers: {
                'Referer': 'https://viral.dutamovie21.cloud/', // Referer kustom yang diperlukan
                'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
            }
        });

        // Periksa apakah respons berhasil
        if (!response.ok) {
            return res.status(response.status).send(`Error fetching URL: ${response.statusText}`);
        }

        // Ambil konten dalam bentuk buffer
        const data = await response.buffer();

        // Teruskan tipe konten dan data ke respons klien
        res.setHeader('Content-Type', response.headers.get('content-type') || 'text/html');
        res.send(data);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
};
