const { createClient } = require('@supabase/supabase-js');
const url = 'https://npobomswhswnhnvpcgna.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wb2JvbXN3aHN3bmhudnBjZ25hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU0MTQ1NywiZXhwIjoyMDg3MTE3NDU3fQ.FF5jS_xaJrN_w55G7Muv5Qkwk1g_tLE3pD40bSPfpJo';
const supabaseAdmin = createClient(url, key);

async function run() {
    try {
        console.log("Calling generateLink with user's key...");
        const siteUrl = 'https://ecommerce-emprende.vercel.app';
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: 'pdiazg46@gmail.com', 
            options: {
                redirectTo: `${siteUrl}/admin/ventas`
            }
        });
        
        console.log("Data:");
        console.dir(data, {depth: null});
        console.log("Error:");
        console.dir(error, {depth: null});
    } catch (e) {
        console.log("Exception thrown!", e.message);
    }
}
run();
