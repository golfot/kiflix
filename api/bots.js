const crypto = require('crypto');  // Untuk AES decryption
const fetch = require('node-fetch');  // Untuk mengambil data dari API

// Fungsi untuk mendekripsi AES
function decryptAES(encryptedText, key, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Fungsi untuk mengambil data dari API
async function fetchData() {
  const url = 'https://tv.idlix.asia/wp-admin/admin-ajax.php';
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept': '*/*',
    'Origin': 'https://tv.idlix.asia',
    'Referer': 'https://tv.idlix.asia/movie/apocalypse-z-the-beginning-of-the-end-2024/'
  };

  const body = new URLSearchParams({
    action: 'doo_player_ajax',
    post: '124474',
    nume: '1',
    type: 'movie'
  }).toString();

  try {
    // Melakukan POST request untuk mendapatkan data
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });

    const data = await response.json();
    console.log('API Response:', data);

    // Mengambil embed_url terenkripsi
    const encryptedData = JSON.parse(data.embed_url);

    // Mengonversi key dan iv dari base64 (jika diperlukan)
    const key = Buffer.from('iwnwajMGDAmNTNFmjDmc1kB9ZyBZ7iXk3ZgQXc=','base64');  // Key harus dalam format Buffer base64
    const iv = Buffer.from('e59620bab1a78e1adf399f30dc014056', 'hex');  // IV dalam format hex

    // Mendekripsi embed_url terenkripsi
    const decryptedEmbedUrl = decryptAES(encryptedData.ct, key, iv);

    // Membuat hasil output dalam format JSON
    const result = {
      status: "success",
      decrypted_embed_url: decryptedEmbedUrl
    };

    // Menampilkan hasil dalam format JSON
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    // Menangani error
    const errorResult = {
      status: "error",
      message: error.message
    };
    console.error(JSON.stringify(errorResult, null, 2));
  }
}

fetchData();
