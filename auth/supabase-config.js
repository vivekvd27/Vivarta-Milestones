/**
 * SUPABASE CONFIGURATION  (shared by login.html and the app)
 * ----------------------------------------------------------------------------
 * Loads the Supabase JS client and exposes a few small helpers on `window`.
 * Static-file friendly: no build step, no ES modules.
 *
 * Requires the Supabase UMD library to be loaded first, e.g.:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 */
(function () {
  // --- Project credentials (anon key is the PUBLIC key — safe in the browser) ---
  var SUPABASE_URL = "https://gqjyuvxuyhedaauxibii.supabase.co";
  var SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxanl1dnh1eWhlZGFhdXhpYmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODg2MzYsImV4cCI6MjA4OTY2NDYzNn0.EA2UAIYGBiqvBu68zlxK1LVDPDKkT2ORHNebshZUSms";
  var PROJECT_REF = "gqjyuvxuyhedaauxibii"; // used to read the persisted session synchronously

  // --- Founders get full ("founder") access. Everyone else is an "employee". ---
  // TODO: add Vivek's and Mirat's real login emails here so they are recognised
  // as founders. Anyone signing up who is NOT in this list becomes an employee.
  var FOUNDER_EMAILS = [
    "vivartam@gmail.com",
    "vivek.dagur@gmail.com",
    "miratrsoni.ms@gmail.com",
  ].map(function (e) { return e.toLowerCase(); });

  // Pretty display names for known accounts (optional).
  var DISPLAY_NAMES = {
    "vivartam@gmail.com": "Vivek Dagur",
    "vivek.dagur@gmail.com": "Vivek Dagur",
    "miratrsoni.ms@gmail.com": "Mirat Soni",
  };

  // Which tabs are founder-only (hidden from employees). Keys match the app's nav keys.
  var FOUNDER_ONLY_TABS = ["affirm", "network"];

  function createClient() {
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error("Supabase library not loaded — include supabase-js@2 before this script.");
    }
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // Resolve a user's role from the founder allowlist (falls back to metadata, then "employee").
  function resolveRole(user) {
    if (!user) return "employee";
    var email = (user.email || "").toLowerCase();
    if (FOUNDER_EMAILS.indexOf(email) !== -1) return "founder";
    return (user.user_metadata && user.user_metadata.role) || "employee";
  }

  // Best display name: known map → metadata full_name → email local-part.
  function resolveName(user) {
    if (!user) return "Guest";
    var email = (user.email || "").toLowerCase();
    if (DISPLAY_NAMES[email]) return DISPLAY_NAMES[email];
    if (user.user_metadata && user.user_metadata.full_name) return user.user_metadata.full_name;
    return (user.email || "User").split("@")[0];
  }

  // Read the persisted Supabase session straight from localStorage (synchronous,
  // no network) so the app can gate the very first paint with no flash/redirect lag.
  function readStoredSession() {
    try {
      var raw = localStorage.getItem("sb-" + PROJECT_REF + "-auth-token");
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      // supabase-js may wrap as { currentSession } (older) or store the session directly.
      var session = parsed && parsed.currentSession ? parsed.currentSession : parsed;
      if (!session || !session.user) return null;
      // Treat an expired access token as no session.
      if (session.expires_at && Date.now() / 1000 > session.expires_at) return null;
      return session;
    } catch (e) {
      return null;
    }
  }

  window.VV_SUPA = {
    SUPABASE_URL: SUPABASE_URL,
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
    PROJECT_REF: PROJECT_REF,
    FOUNDER_EMAILS: FOUNDER_EMAILS,
    FOUNDER_ONLY_TABS: FOUNDER_ONLY_TABS,
    createClient: createClient,
    resolveRole: resolveRole,
    resolveName: resolveName,
    readStoredSession: readStoredSession,
  };
})();
