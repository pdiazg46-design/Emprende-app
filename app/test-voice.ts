import { processVoiceCommand } from './app/actions/process-voice';

// mock auth temporarily for test script
jest.mock('@/lib/auth', () => ({
    auth: async () => ({ user: { email: 'test@test.com', subscriptionPlan: 'PRO' } })
}));

async function main() {
    console.log("Testing voice command...");
    const res = await processVoiceCommand("vendí un anillo y una bebida");
    console.log("Result:", JSON.stringify(res, null, 2));
}

main().catch(console.error);
