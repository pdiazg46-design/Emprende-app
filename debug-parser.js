const { parseVoiceCommand } = require('./app/lib/voice/intentParser');

const testCases = [
    "vendí 3 pulseras grandes",
    "venta de 5000",
    "gasto de 2000 en taxi"
];

testCases.forEach(text => {
    console.log(`Input: "${text}"`);
    console.log(JSON.stringify(parseVoiceCommand(text), null, 2));
    console.log("---------------------------------------------------");
});
