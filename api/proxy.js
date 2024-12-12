const crypto = require('crypto');
const fetch = require('node-fetch');

// Kelas CryptoJsAes untuk enkripsi dan dekripsi
class CryptoJsAes {
    static decrypt(jsonStr, passphrase) {
        const jsonData = JSON.parse(jsonStr);
        const salt = Buffer.from(jsonData.s, 'hex');
        const iv = Buffer.from(jsonData.iv, 'hex');
        const ct = Buffer.from(jsonData.ct, 'base64');

        const concatedPassphrase = Buffer.concat([Buffer.from(passphrase), salt]);
        let result = crypto.createHash('md5').update(concatedPassphrase).digest();

        for (let i = 1; i < 3; i++) {
            result = Buffer.concat([result, crypto.createHash('md5').update(Buffer.concat([result, concatedPassphrase])).digest()]);
        }

        const key = result.slice(0, 32);

        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        const decryptedData = Buffer.concat([decipher.update(ct), decipher.final()]);

        try {
            return JSON.parse(CryptoJsAes._unpad(decryptedData).toString('utf-8'));
        } catch (e) {
            console.error(`Error decoding JSON: ${e}`);
            return null;
        }
    }

    static _unpad(s) {
        const padding = s[s.length - 1];
        return s.slice(0, s.length - padding);
    }
}

// Fungsi untuk menambahkan padding pada string base64
function addBase64Padding(b64String) {
    const padLength = (4 - (b64String.length % 4)) % 4; // Pastikan nilai berada di 0-3
    return b64String + '='.repeat(padLength);
}

// Fungsi untuk mendekode
function dec(r, e) {
    const rList = [];
    for (let i = 2; i < r.length; i += 4) {
        rList.push(r.substr(i, 2));
    }

    const mPadded = addBase64Padding(e.split('').reverse().join(''));
    let decodedM = '';

    try {
        decodedM = Buffer.from(mPadded, 'base64').toString('utf-8');
    } catch (e) {
        console.error(`Base64 decoding error: ${e}`);
        return "";
    }

    const decodedMList = decodedM.split("|");
    return decodedMList.map(s => {
        const index = parseInt(s);
        return (s.match(/^\d+$/) && index < rList.length) ? "\\x" + rList[index] : '';
    }).join('');
}

// Fungsi untuk mendapatkan embed URL
async function getEmbedUrl(request) {
    try {
        // Debugging: Periksa respons lengkap
        console.log('Complete Request Data:', request.data);

        if (request.status === 200 && request.data.embed_url) {
            const key = request.data.key;
            const mValue = JSON.parse(request.data.embed_url)?.m;

            // Validasi key dan mValue
            if (!key || !mValue) {
                console.error('Key or mValue missing:', { key, mValue });
                return {
                    status: false,
                    message: 'Invalid key or mValue for decryption'
                };
            }

            // Debugging: Log params sebelum dekripsi
            console.log('Decrypt Params:', {
                embed_url: request.data.embed_url,
                passphrase: dec(key, mValue)
            });

            const embedUrlDecrypted = CryptoJsAes.decrypt(
                request.data.embed_url,
                dec(key, mValue)
            );

            console.log('Decrypted Embed URL:', embedUrlDecrypted);

            return {
                status: true,
                embed_url: embedUrlDecrypted
            };
        } else {
            console.error('Invalid Response:', request);
            return {
                status: false,
                message: 'Failed to get embed URL'
            };
        }
    } catch (error) {
        console.error('Decryption Error:', error);
        return {
            status: false,
            message: error.toString()
        };
    }
}

// Fungsi untuk request data dari API
async function fetchData() {
    const url = 'https://tv4.idlix.asia/wp-admin/admin-ajax.php';
    const body = 'action=doo_player_ajax&post=124474&nume=1&type=movie';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonResponse = await response.json();
        
        // Debugging: Log raw API response
        console.log('Raw API Response:', jsonResponse);

        const result = await getEmbedUrl({ status: 200, data: jsonResponse });
        console.log(result);
    } catch (error) {
        console.error(`Fetch error: ${error}`);
    }
}

// Jalankan fungsi fetchData
fetchData();
