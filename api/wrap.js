// Filename: api/warp.js

const https = require("https");

console.log(`
 __          __     _____  _____          
 \\ \\        / /\\   |  __ \\|  __ \\     _   
  \\ \\  /\\  / /  \\  | |__) | |__) |  _| |_ 
   \\ \\/  \\/ / /\\ \\ |  _  /|  ___/  |_   _|
    \\  /\\  / ____ \\| | \\ \\| |        |_|  
     \\/  \\/_/    \\_\\_|  \\_\\_|             
`);

console.log("1111 / Warp Vpn WARP+ Unlimited GB");
console.log("");
console.log("Script : by revWhiteShadow");
console.log("Codename : motherfucker rem01gaming ");
console.log("");
console.log("Website : www.godTspeed.xyz");
console.log("Website : www.magiskflash.com");
console.log("Telegram : @godTspeed");
console.log("Telegram : @godspeedmode");
console.log("");

// Helper functions
const genString = (length) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const digitString = (length) => {
    const digits = "0123456789";
    return Array.from({ length }, () => digits[Math.floor(Math.random() * digits.length)]).join('');
};

// Main function
async function sendRequest(req, res) {
    const WARP_CLIENT_ID = req.query.clientId;
    if (!WARP_CLIENT_ID) {
        res.status(400).json({ error: "Please provide WARP client ID as a query parameter." });
        return;
    }

    const url = `https://api.cloudflareclient.com/v0a${digitString(3)}/reg`;

    const installId = genString(22);
    const payload = JSON.stringify({
        key: `${genString(43)}=`,
        install_id: installId,
        fcm_token: `${installId}:APA91b${genString(134)}`,
        referrer: WARP_CLIENT_ID,
        warp_enabled: false,
        tos: new Date().toISOString().slice(0, -5) + "+02:00",
        type: "Android",
        locale: "es_ES"
    });

    const options = {
        hostname: 'api.cloudflareclient.com',
        path: `/v0a${digitString(3)}/reg`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'User-Agent': 'okhttp/3.12.1',
            'Accept-Encoding': 'gzip',
            'Connection': 'Keep-Alive',
            'Host': 'api.cloudflareclient.com'
        }
    };

    const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });

        response.on('end', () => {
            if (response.statusCode === 200) {
                res.status(200).json({ message: "PASSED: +1GB added", data: JSON.parse(data) });
            } else {
                res.status(response.statusCode).json({ error: "FAILED", statusCode: response.statusCode });
            }
        });
    });

    request.on('error', (error) => {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ error: error.message });
    });

    request.write(payload);
    request.end();
}

// Vercel-compatible export
module.exports = (req, res) => {
    if (req.method === 'GET') {
        sendRequest(req, res);
    } else {
        res.status(405).json({ error: "Only GET requests are allowed" });
    }
};
