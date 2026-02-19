const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'finanza.db');
console.log('Opening DB at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        process.exit(1);
    }
    console.log('Connected to the finanza database.');
});

db.serialize(() => {
    db.each("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
        if (err) {
            console.error(err.message);
        }
        console.log(row.name);
    });
});

db.close();
