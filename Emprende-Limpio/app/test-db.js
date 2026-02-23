
const { PrismaClient } = require('@prisma/client');
console.log("--- Root DB Test ---");
const prisma = new PrismaClient({
    datasources: { db: { url: "file:./prisma/dev.db" } }
});
async function main() {
    try {
        const c = await prisma.user.count();
        console.log("✅ Users:", c);
    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
