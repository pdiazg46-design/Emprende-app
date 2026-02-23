
console.log("--- 🕵️ Environment Verification ---");
console.log(`DATABASE_URL: ${process.env.DATABASE_URL}`);
console.log(`AUTH_SECRET Length: ${process.env.AUTH_SECRET?.length}`);
console.log(`AUTH_SECRET Value (First 4 chars): ${process.env.AUTH_SECRET?.substring(0, 4)}...`);
console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
