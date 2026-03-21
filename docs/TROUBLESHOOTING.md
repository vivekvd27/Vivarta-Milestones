# Supabase Integration - Troubleshooting Guide

**Quick Reference for Common Issues**

---

## 🔴 "Blank Page on Load"

### Symptoms
- Page loads but nothing displays
- Console shows errors
- No login screen appears

### Solutions

#### Check 1: Supabase Script Loading

```javascript
// In browser console:
console.log(window.supabase);        // Should exist
console.log(window.supabaseConfig);  // Should exist
console.log(window.supabaseApp);     // Should exist
```

If any are `undefined`:

1. Check Network tab → see if CDN loaded
2. Check script order in index.html
3. Try manually refreshing

#### Check 2: Credentials Missing

```javascript
// In console:
console.log(window.supabaseConfig.SUPABASE_URL);
console.log(window.supabaseConfig.SUPABASE_ANON_KEY);
// Both should show URLs/keys, not "https://your-project..."
```

**Fix:** Edit `src/js/supabase-config.js` with real credentials

#### Check 3: JavaScript Errors

```javascript
// In console, look for errors like:
// "Cannot read property 'createClient' of undefined"
// → Supabase CDN didn't load
// "TypeError: window.supabaseApp is not defined"
// → App bridge didn't initialize
```

**Fix:**
1. Refresh page hard (Ctrl+Shift+R on Windows)
2. Clear browser cache
3. Check console for specific error messages

---

## 🔴 "Login Screen Not Appearing"

### Symptoms
- Page loads
- No login form visible
- Dashboard appears but disabled

### Solutions

```javascript
// Check auth state:
window.supabaseApp.auth.getCurrentUser();
// Should return null if not logged in

// Check if login UI rendered:
document.querySelector("#supabaseLoginModal");
// Should exist if login screen visible
```

**If login screen should show but doesn't:**

1. **Check CSS issues:**
```css
/* Make sure nothing is hiding the modal */
#supabaseLoginModal {
  display: flex !important;  /* Should be visible */
  z-index: 10000 !important; /* Should be on top */
}
```

2. **Force show login screen:**
```javascript
window.supabaseApp.showLoginScreen();
```

3. **Check browser console for errors**
```
- "showLoginScreen is not a function" → app not initialized
- CSS parsing errors → styling issue
```

---

## 🔴 "Login Works But Data Doesn't Load"

### Symptoms
- Login successful
- Dashboard shows but widgets empty
- Data appears blank

### Solutions

#### Check 1: Database Setup

```javascript
// In console, fetch data manually:
const { data, error } = await window.supabaseApp.dataSync.supabase
  .from("timeline_events")
  .select("*")
  .eq("user_id", window.supabaseApp.getCurrentUserId());

console.log(data, error);
// Should show array of events or permission error
```

**Common error: "row level security policy"**
- Means RLS is working but user can't access data
- Check SUPABASE_SCHEMA.sql was executed
- Verify RLS policies are in place

#### Check 2: Data Fetching

```javascript
// Check if data sync initialized:
console.log(window.supabaseApp.dataSync.syncedData);
// Should show: {timeline: [...], meetings: [...], ...}

// If empty or missing, force refresh:
await window.supabaseApp.dataSync.initialize();
```

#### Check 3: RLS Policies

Login to Supabase dashboard:
1. Go to **Authentication Editor**
2. Click on user in Users list
3. Go to **Table Editor**
4. Click each table (timeline_events, meetings, etc.)
5. Check **Policies** tab
6. Should see 2 policies per table

**If no policies:**
- Run SUPABASE_SCHEMA.sql again
- Manually create policies (see schema file)

---

## 🔴 "Real-Time Updates Not Working"

### Symptoms
- Add item in another browser tab
- New item doesn't appear
- Page shows stale data

### Solutions

#### Check 1: Subscriptions Active

```javascript
// Check if subscriptions exist:
console.log(window.supabaseApp.dataSync.subscriptions);
// Should have subscriptions for all 9 tables
// If empty, subscriptions failed
```

#### Check 2: Realtime Enabled in Supabase

In Supabase dashboard:
1. Go to **Settings → Database**
2. Find "Replication" section
3. All tables should have "realtime" publication enabled

**If not enabled:**
```sql
-- Run in Supabase SQL editor:
ALTER PUBLICATION supabase_realtime ADD TABLE public.timeline_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
-- ... repeat for all tables
```

#### Check 3: Browser Networking

```javascript
// Check if real-time connection established:
console.log(window.supabaseApp.dataSync.supabase.getChannels());
// Should show array of active channels
```

**If no channels:**
- Check firewall/proxy isn't blocking WebSocket
- Test on different network
- Try different browser

---

## 🔴 "Can See Other Users' Data"

### Symptoms
- **🚨 SECURITY ISSUE**
- Logged in as User A
- Seeing User B's meetings/events
- Data cross-contamination

### Solutions

**IMMEDIATE ACTIONS:**
1. **Stop using app** - potential breach
2. **Verify credentials** - check supabase-config.js
3. **Check database logs** - Supabase dashboard

**Check RLS Policies:**

```sql
-- In Supabase SQL editor, run:
SELECT * FROM information_schema.table_privileges 
WHERE table_name = 'timeline_events';

-- Check that policies restict to current user:
SELECT * FROM pg_policies 
WHERE tablename = 'timeline_events';
-- Should see policies with "auth.uid() = user_id"
```

**Fix RLS Policies:**

```sql
-- Drop existing policies (if broken)
DROP POLICY IF EXISTS "users_can_view_own_timeline" ON public.timeline_events;
DROP POLICY IF EXISTS "users_can_crud_own_timeline" ON public.timeline_events;

-- Re-create correct policies
CREATE POLICY "users_can_view_own_timeline" ON public.timeline_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_crud_own_timeline" ON public.timeline_events
  FOR INSERT, UPDATE, DELETE USING (auth.uid() = user_id);
```

---

## 🔴 "Syncing Too Slow / Lots of Lag"

### Symptoms
- Add item takes 2-3 seconds
- Other client doesn't see updates for 5+ seconds
- Lots of network requests

### Solutions

#### Check 1: Network Performance

```javascript
// Time a sync operation:
console.time("sync");
await window.supabaseApp.addItem("meetings", {
  title: "Test",
  date: "2026-03-25"
});
console.timeEnd("sync");
// Should be < 500ms normally
```

**If > 1 second:**
- Check internet connection speed
- Check if Supabase project is scaling (dashboard)
- Check browser Network tab for errors

#### Check 2: Too Many Subscriptions

```javascript
// Check if subscriptions duplicated:
window.supabaseApp.dataSync.subscriptions.length;
// Should be exactly 9 (one per table)
// If > 20, subscriptions are stacking

// Fix:
await window.supabaseApp.dataSync.unsubscribeAll();
await window.supabaseApp.dataSync.initialize();
```

#### Check 3: Large Datasets

If app loads 10,000+ records:

```javascript
// Use pagination instead:
const page1 = await window.supabaseApp.dataSync.supabase
  .from("timeline_events")
  .select("*")
  .range(0, 99);  // Load 100 at a time

const page2 = await window.supabaseApp.dataSync.supabase
  .from("timeline_events")
  .select("*")
  .range(100, 199);
```

---

## 🔴 "localStorage Fallback Not Working"

### Symptoms
- Supabase unavailable
- App tries to sync but fails
- Data lost

### Solutions

```javascript
// Check fallback mode active:
console.log(window.supabaseApp);
// Should show { offline: true } if in fallback

// Check localStorage:
console.log(localStorage.getItem("vivartaState"));
// Should contain your data

// Manually enable fallback:
window.supabaseApp.offline = true;
```

**Fallback Limitations:**
- Data only stored locally
- Won't sync to Supabase
- Won't appear on other devices
- Will be lost if browser cleared

---

## 🔴 "Session Expires / Logged Out"

### Symptoms
- Working fine
- Suddenly logged out
- Get redirected to login

### Solutions

```javascript
// Check session status:
const user = window.supabaseApp.auth.getCurrentUser();
console.log(user);  // Should show user object

// Session monitoring:
window.supabaseApp.auth.monitorSession();
// Manually restart if not running

// Re-login:
await window.supabaseApp.auth.signIn(
  "user@example.com",
  "password"
);
```

**Why it happens:**
- Token expired (24 hours default)
- Browser cleared cookies
- Network disconnection
- Too long without activity

**Prevention:**
- App auto-refreshes tokens
- monitorSession() checks every 30 min
- Should remain logged in for days

---

## 🟡 "Slow Initial Load"

### Symptoms
- First page load takes 5-10 seconds
- Console shows fetching data
- User waits long time

### Solutions

#### Check 1: Data Volume

```javascript
// See how much data fetched:
console.log(window.supabaseApp.dataSync.syncedData);
const totalItems = Object.values(syncedData)
  .reduce((sum, arr) => sum + arr.length, 0);
console.log(`Total items: ${totalItems}`);
```

**If 10,000+:** Consider pagination (see Performance section)

#### Check 2: Network Speed

```javascript
// Measure fetch time:
const start = Date.now();
await window.supabaseApp.dataSync.initialize();
console.log(`Fetch took ${Date.now() - start}ms`);
```

**Expected:**
- < 1 second on fast network
- < 3 seconds on slow network
- > 5 seconds = network issue

#### Check 3: Supabase Performance

In Supabase dashboard:
1. Go to **Settings → Database**
2. Check RAM/CPU usage
3. Check query logs
4. Upgrade if needed

---

## 🟡 "Memory Usage Growing"

### Symptoms
- App gets slow over time
- Browser memory usage increases
- Page eventually crashes

### Solutions

```javascript
// Check appState size:
JSON.stringify(window.supabaseApp.appState).length / (1024*1024);
// Size in MB - should be < 10MB

// Check for memory leaks:
console.log(window.supabaseApp.dataSync.subscriptions.length);
// Should be exactly 9
```

**Common causes:**
1. Duplicate subscriptions → Clean up with unsubscribeAll()
2. Event listeners not removed → Check for memory leaks
3. Cached images/files → Implement cleanup

**Fix:**

```javascript
// Restart sync cleanly:
await window.supabaseApp.dataSync.unsubscribeAll();
await window.supabaseApp.dataSync.initialize();
```

---

## 🟡 "Firefox / Safari Issues"

### Symptoms
- Works in Chrome
- Fails in Firefox/Safari
- Different behavior

### Solutions

#### WebSocket Support

Real-time needs WebSocket. Verify:

```javascript
// Check WebSocket availability:
typeof WebSocket;  // Should be "function"
```

All modern browsers support it.

#### localStorage API

Verify localStorage works:

```javascript
// Test localStorage:
localStorage.setItem("test", "value");
console.log(localStorage.getItem("test"));  // Should show "value"
```

#### CORS Issues

If cross-domain:

```javascript
// Check browser console for CORS errors
// Fix: Ensure Supabase URL is in CORS allowlist
```

---

## ✅ Verification Checklist

### Before Going to Production

- [ ] Can login with email/password
- [ ] Dashboard loads data
- [ ] Can add/edit/delete items
- [ ] Changes persist after refresh
- [ ] Real-time sync works (2 browser tabs)
- [ ] No RLS errors in console
- [ ] No data leakage between users
- [ ] Works on Chrome, Firefox, Safari
- [ ] Works on mobile (if needed)
- [ ] Performance < 2 seconds to load

### Regular Health Checks

- [ ] Monitor error logs (browser console)
- [ ] Check database performance (Supabase dashboard)
- [ ] Test inter-user data isolation
- [ ] Verify real-time subscriptions active
- [ ] Check storage usage (< 100MB per user)
- [ ] Monitor authentication issues

---

## 🆘 When All Else Fails

### Nuclear Options (Last Resort)

1. **Full Reset**
```javascript
// Warning: Clears all local cache
localStorage.clear();
location.reload();
// Will force re-download all data
```

2. **Re-initialize App**
```javascript
// Full restart
window.supabaseApp.dataSync.unsubscribeAll();
await window.supabaseApp = null;
location.reload();
```

3. **Contact Support**
- Supabase: https://supabase.com/support
- GitHub Issues: https://github.com/supabase/supabase
- Email: support@supabase.com

---

## 📚 Useful Commands (Console)

```javascript
// User Info
window.supabaseApp.getCurrentUserId()
window.supabaseApp.getCurrentUser()

// Data Info
window.supabaseApp.appState
window.supabaseApp.dataSync.syncedData
window.supabaseApp.dataSync.subscriptions

// Debugging
localStorage.clear()
window.supabaseApp.dataSync.unsubscribeAll()
await window.supabaseApp.dataSync.initialize()

// Direct Supabase Access
window.supabaseApp.dataSync.supabase.from("timeline_events").select("*")

// Auth
window.supabaseApp.auth.signOut()
window.supabaseApp.auth.monitorSession()

// Events
window.addEventListener("supabaseSync", console.log)
window.addEventListener("stateChange", console.log)
```

---

**Last Updated:** March 21, 2026  
**Version:** 1.0  
**Status:** Production Ready
