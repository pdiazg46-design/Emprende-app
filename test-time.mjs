const tzOffsetHours = 3;
const baseDate = new Date(); // now

const chileTime = new Date(baseDate.getTime() - (tzOffsetHours * 60 * 60 * 1000));

const year = chileTime.getUTCFullYear();
const month = chileTime.getUTCMonth();
const date = chileTime.getUTCDate();

// Medianoche en Chile expresada en horario UTC
const todayStart = new Date(Date.UTC(year, month, date, tzOffsetHours, 0, 0, 0));

// Medianoche Final en Chile (23:59:59)
const todayEnd = new Date(Date.UTC(year, month, date, tzOffsetHours + 23, 59, 59, 999));

console.log("Servidor BaseDate:", baseDate.toISOString());
console.log("Chile Time:", chileTime.toISOString());
console.log("Calculated Year:", year, "Month:", month, "Date:", date);
console.log("---");
console.log("Límite Inferior (DB):", todayStart.toISOString());
console.log("Límite Superior (DB):", todayEnd.toISOString());

// Check if current date falls within them
console.log("---");
console.log("Is BaseDate within bounds?", baseDate >= todayStart && baseDate <= todayEnd);

// Let's pretend a transaction was made at 20:47:00 Chile Time today (UTC: 23:47:00)
const simulatedTransactionDate = new Date("2026-03-11T23:47:00.000Z");
console.log("Simulated Tx (20:47 Chile):", simulatedTransactionDate.toISOString());
console.log("Is Tx within bounds?", simulatedTransactionDate >= todayStart && simulatedTransactionDate <= todayEnd);
