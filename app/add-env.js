const { execSync } = require('child_process');

try {
    console.log("Insertando DB URL sin saltos de linea en Vercel...");
    execSync(`node -e "process.stdout.write('postgres://16edf67f0a84b357f04c9ef665a79e2c46f4ec45faa22730f9e40e4bf400cfad:sk_46_eXqtA75nb4J9sQWQbN@db.prisma.io:5432/postgres?sslmode=require')" | npx vercel env add FINANZA_DATABASE_URL production`, { stdio: 'inherit' });
    console.log("¡Hecho!");
} catch (e) {
    console.error("Fallo", e);
}
