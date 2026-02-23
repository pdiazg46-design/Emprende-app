
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config(); // Load .env from CWD

console.log("--- Runtime Connection Test ---");
console.log(`DATABASE_URL: ${process.env.DATABASE_URL}`);

const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.user.count();
        console.log(`✅ Success! User count: ${count}`);
    } catch (e) {
        console.error("❌ Connection failed:", e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
