/* ============================================================
   SUPABASE-CLIENT.JS
   1) Create a free project at https://supabase.com
   2) Copy the "Project URL" and "anon public key" (Settings > API)
   3) Paste them below
   4) Run /supabase/schema.sql in the Supabase SQL editor
   ============================================================ */
const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY";

let supabaseClient = null;
let DEMO_MODE = SUPABASE_URL.includes("YOUR-PROJECT");

if (!DEMO_MODE && window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
