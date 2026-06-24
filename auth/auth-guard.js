/**
 * AUTH GUARD  (app-side)
 * ----------------------------------------------------------------------------
 * Runs synchronously in the app's <head>, BEFORE the app renders, so there is no
 * unauthenticated flash. If there is no valid Supabase session it redirects to
 * the login page. Otherwise it publishes the current user on `window.VV_AUTH`.
 *
 * Load order in the app:
 *   1. supabase-config.js   (defines VV_SUPA; reads the session from localStorage)
 *   2. auth-guard.js        (this file)
 *   3. supabase-js library  (async, from CDN — only needed for signOut())
 */
(function () {
  if (!window.VV_SUPA) {
    console.error("auth-guard: supabase-config.js must load first.");
    return;
  }

  var session = window.VV_SUPA.readStoredSession();
  if (!session) {
    // Remember where we were so we can come back after login (optional nicety).
    try { sessionStorage.setItem("vv_return_to", location.pathname + location.search); } catch (e) {}
    location.replace("login.html");
    return;
  }

  var user = session.user;
  window.VV_AUTH = {
    email: user.email,
    name: window.VV_SUPA.resolveName(user),
    role: window.VV_SUPA.resolveRole(user), // "founder" | "employee"
    isFounder: window.VV_SUPA.resolveRole(user) === "founder",
    founderOnlyTabs: window.VV_SUPA.FOUNDER_ONLY_TABS,
    user: user,
    signOut: function () {
      try {
        var supa = window.VV_SUPA.createClient();
        supa.auth.signOut().finally(function () { location.replace("login.html"); });
      } catch (e) {
        // Library not loaded yet — clear local session and bounce to login anyway.
        try { localStorage.removeItem("sb-" + window.VV_SUPA.PROJECT_REF + "-auth-token"); } catch (_) {}
        location.replace("login.html");
      }
    },
  };

  // Tag the document so CSS/JS can react to the role.
  try { document.documentElement.setAttribute("data-role", window.VV_AUTH.role); } catch (e) {}
})();
