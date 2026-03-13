const crypto = require('crypto');

async function testFetch() {
    try {
        const algorithm = 'aes-256-cbc';
        const secretKey = 'c17ea4e6-88a5-43ad-a8ee-df6c6b02fc47';
        const hashStr = crypto.createHash('sha256').update(String(secretKey)).digest('hex').substring(0, 32);
        const keyBuffer = Buffer.from(hashStr, 'utf8');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
        const payload = {
            userId: 'cuid_123',
            email: 'pdiazg46@gmail.com',
            exp: Date.now() + 60000 * 1000 
        };
        let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const encryptedToken = `${iv.toString('hex')}:${encrypted}`;
        
        const url = `https://ecommerce-emprende.vercel.app/api/sso-login?token=${encodeURIComponent(encryptedToken)}`;
        console.log("Fetching: ", url);
        
        const response = await fetch(url);
        const data = await response.text();
        console.log("HTTP Status: ", response.status);
        console.log("Response Body: ", data);
    } catch (e) {
        console.log("Fetch Error", e);
    }
}

testFetch();
