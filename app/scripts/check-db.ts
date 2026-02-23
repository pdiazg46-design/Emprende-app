
// Ensure env is loaded
try { process.loadEnvFile(); } catch (e) { console.log("Node version <20 or .env missing, trying to continue..."); }
import { prisma } from "../lib/prisma"

async function main() {
    console.log("--- 🕵️ DB Connection Check ---");
    try {
        const userCount = await prisma.user.count();
        console.log(`✅ Success! Users in DB: ${userCount}`);
    } catch (e: any) {
        console.error("❌ Failed:", e.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
