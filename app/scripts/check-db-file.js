
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
console.log(`Checking DB at: ${dbPath}`);

if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    console.log(`✅ DB Found. Size: ${stats.size} bytes`);
} else {
    console.error(`❌ DB NOT FOUND at ${dbPath}`);
    // Check parent dirs
    console.log('List of prisma dir:', fs.readdirSync(path.join(__dirname, '..', 'prisma')));
}
