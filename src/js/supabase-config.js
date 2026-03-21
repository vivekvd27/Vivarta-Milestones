/**
 * SUPABASE CONFIGURATION
 * Initialize Supabase client for real-time sync and authentication
 */

// Replace these with your Supabase credentials
const SUPABASE_URL = "https://gqjyuvxuyhedaauxibii.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxanl1dnh1eWhlZGFhdXhpYmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODg2MzYsImV4cCI6MjA4OTY2NDYzNn0.EA2UAIYGBiqvBu68zlxK1LVDPDKkT2ORHNebshZUSms";

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log("✓ Supabase connected");
    return true;
  } catch (error) {
    console.error("✗ Supabase connection failed:", error.message);
    return false;
  }
}

// Export for use in app
// Note: Using window object for static file compatibility (no ES modules)
window.supabaseConfig = {
  supabase,
  testConnection: testSupabaseConnection,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
};
