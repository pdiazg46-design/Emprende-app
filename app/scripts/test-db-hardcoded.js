
const { PrismaClient } = require('@prisma/client');

console.log("--- Hardcoded Connection Test ---");
const dbUrl = "file:./prisma/dev.db"; // Explicit path relative to CWD (app/)
console.log(`Using URL: ${dbUrl}`);

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl,
        },
    },
});

async function main() {
    try {
        const userCount = await prisma.user.count();
        console.log(`✅ Success! Users in DB: ${userCount}`);
    } catch (e) {
        console.error("❌ Failed:", e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
