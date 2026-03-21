# Supabase Cloud Storage - Verification & Testing Guide

**Ensure data is stored in Supabase, NOT in browser localStorage**

---

## ✅ Step 1: Verify Credentials are Valid

### Test 1: Connection Check (Browser Console)

Open your app and run in browser console:

```javascript
// Test 1: Check if Supabase is available
console.log("1. Supabase library loaded:", typeof window.supabase);

// Test 2: Check if config exists
console.log("2. Config object:", window.supabaseConfig);

// Test 3: Check credentials
console.log("3. Supabase URL:", window.supabaseConfig.SUPABASE_URL);
console.log("4. Anon Key length:", window.supabaseConfig.SUPABASE_ANON_KEY.length);

// Test 4: Verify connection to Supabase
const isConnected = await window.supabaseConfig.testConnection();
console.log("5. Connected to Supabase:", isConnected);
```

**Expected Output (all should be ✅):**
```
1. Supabase library loaded: function
2. Config object: {supabase, testConnection, SUPABASE_URL, SUPABASE_ANON_KEY}
3. Supabase URL: https://gqjyuvxuyhedaauxibii.supabase.co
4. Anon Key length: 100+
5. Connected to Supabase: true
```

### If Connection Fails

❌ Error: `Connected to Supabase: false`

**Check:**
1. Credentials correct in `src/js/supabase-config.js`
2. Supabase project still exists at https://app.supabase.com
3. Project is active (not paused)
4. Try again with hard refresh: `Ctrl+Shift+R`

---

## ✅ Step 2: Verify Database is Set Up

From Supabase Dashboard:

### Check 1: Tables Exist

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** → **New Query**
4. Run this:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Result (should see 9 tables):**
```
├── affirmations
├── announcements
├── contacts
├── future_events
├── goals
├── meetings
├── milestones
├── rule_of_three_tasks
└── timeline_events
```

### Check 2: RLS Policies Enabled

1. Go to **Table Editor**
2. Click each table
3. Click **Policies** tab
4. Each table should have 2 policies

**Example policies for `meetings` table:**
- `users_can_view_own_meetings`
- `users_can_crud_own_meetings`

---

## ✅ Step 3: Verify Data Storage Method

### Check What Your App is Using

```javascript
// In browser console, test add a record:
const testData = {
  id: "test-" + Date.now(),
  title: "Test Item",
  date: new Date().toISOString().split('T')[0],
  person: "Vivek"
};

// Add to appState (your app would normally do this)
appState.timeline.push(testData);
saveState();

console.log("Item added, checking where it's stored...");
```

### Check 1: Is it in localStorage?

```javascript
// Check localStorage
const localData = localStorage.getItem("vivartaState_Vivek");
console.log("1. In localStorage?", localData ? "YES" : "NO");

// This shows demo mode (per-user localStorage)
if (localData) {
  const parsed = JSON.parse(localData);
  console.log("   Timeline items:", parsed.timeline?.length || 0);
}
```

### Check 2: Is it in Supabase?

```javascript
// Check Supabase directly
const supabase = window.supabaseConfig.supabase;

const { data, error } = await supabase
  .from("timeline_events")
  .select("*");

console.log("2. In Supabase?", data && data.length > 0 ? "YES" : "NO");
if (data) {
  console.log("   Records in database:", data.length);
  console.log("   Sample records:", data.slice(0, 2));
}
```

**Interpretation:**

| localStorage | Supabase | Meaning |
|---|---|---|
| ✅ YES | ❌ NO | **Problem:** Using demo mode (not connected) |
| ✅ YES | ✅ YES | **Good:** Using both (sync working) |
| ❌ NO | ✅ YES | **Perfect:** Cloud-only storage |

---

## ✅ Step 4: Verify Real-Time Sync

### Test Real-Time Updates

**Open 2 browser windows:**
- Window A: http://localhost:8000
- Window B: http://localhost:8000

**In Window A - Add data:**
```javascript
// Add a meeting
appState.meetings.push({
  id: "sync-test-" + Date.now(),
  title: "Real-Time Test",
  date: "2026-03-25",
  person: "Vivek"
});
saveState();
console.log("Meeting added in Window A");
```

**Check Window B:**
- Does new meeting appear in real-time? **YES = ✅ Real-time working**
- Appeared after 1-2 seconds? **YES = ✅ Sync is fast**
- Had to refresh to see it? **YES = ❌ Real-time not connected**

---

## ✅ Step 5: Verify Data Isolation

### Test: Different Users See Different Data

**Tab A - Login as Vivek:**
```javascript
localStorage.setItem("vivarta_demo_user", "Vivek");
location.reload();
// Add some meetings
```

**Tab B - Login as Mirat:**
```javascript
localStorage.setItem("vivarta_demo_user", "Mirat");
location.reload();
// Check - should NOT see Vivek's meetings
```

**Verify in Supabase Console:**

```sql
-- Check whose meeting belongs to whom
SELECT 
  id,
  title,
  user_id,
  created_at
FROM public.meetings
ORDER BY created_at DESC
LIMIT 10;

-- Each meeting should have user_id specifying owner
```

---

## 🧪 Complete Verification Test

Run this comprehensive test in browser console:

```javascript
console.log("========== SUPABASE VERIFICATION TEST ==========\n");

// 1. Configuration Check
console.log("1. CONFIGURATION CHECK:");
console.log("   ✓ URL:", window.supabaseConfig.SUPABASE_URL);
console.log("   ✓ Key loaded:", !!window.supabaseConfig.SUPABASE_ANON_KEY);

// 2. Connection Check
console.log("\n2. CONNECTION CHECK:");
try {
  const isConnected = await window.supabaseConfig.testConnection();
  console.log("   ✓ Connected:", isConnected ? "YES" : "NO");
} catch (error) {
  console.error("   ✗ Connection error:", error.message);
}

// 3. Database Check
console.log("\n3. DATABASE CHECK:");
const supabase = window.supabaseConfig.supabase;
try {
  const { data: tables, error } = await supabase
    .from("meetings")
    .select("count(*)");
  console.log("   ✓ Can query meetings table:", !error);
  console.log("   ✓ Records in database:", tables?.length || 0);
} catch (error) {
  console.error("   ✗ Database error:", error.message);
}

// 4. Storage Check
console.log("\n4. STORAGE CHECK:");
const hasMeetings = !!localStorage.getItem("vivartaState_Vivek");
console.log("   ✓ localStorage (demo):", hasMeetings ? "YES" : "NO");

// 5. Current User Check
console.log("\n5. CURRENT USER:");
console.log("   ✓ Current user:", window.supabaseApp.getCurrentUserName());
console.log("   ✓ Demo mode:", window.supabaseApp.demoMode);
console.log("   ✓ Initialized:", window.supabaseApp.isInitialized);

console.log("\n========== TEST COMPLETE ==========");
```

---

## 🔍 Check Data in Supabase Dashboard

### View Stored Records

1. Go to https://app.supabase.com
2. Select project
3. Click **Table Editor**
4. Select a table (e.g., `meetings`)
5. Should see all stored records with columns:
   - `id` (UUID)
   - `user_id` (who owns it)
   - `title`, `date`, `person`
   - `created_at`, `updated_at`

### Count Total Records

```sql
-- In SQL Editor, get counts:
SELECT 
  'timeline_events' as table_name, COUNT(*) as count FROM public.timeline_events
UNION ALL
SELECT 'meetings', COUNT(*) FROM public.meetings
UNION ALL
SELECT 'contacts', COUNT(*) FROM public.contacts
UNION ALL
SELECT 'affirmations', COUNT(*) FROM public.affirmations
UNION ALL
SELECT 'goals', COUNT(*) FROM public.goals
ORDER BY count DESC;
```

---

## 🐛 Troubleshooting

### Problem 1: "Data in localStorage but not in Supabase"

**Cause:** App running in **demo mode** (not syncing to cloud)

**Solution:** Switch app to Supabase sync mode:

```javascript
// Check if real sync is happening:
console.log("Demo mode active:", window.supabaseApp.demoMode);
// If true, app is NOT syncing to Supabase

// Disable demo mode (in supabase-app.js):
// Change: this.demoMode = true;
// To: this.demoMode = false;
```

### Problem 2: "Connection fails: auth.getSession error"

**Cause:** Supabase credentials invalid or project disabled

**Solution:**
1. Check project is active: https://app.supabase.com
2. Verify credentials in `supabase-config.js`
3. Check if project quota exceeded
4. Try creating new project if old one expired

### Problem 3: "RLS policy error when saving"

**Cause:** Row-Level Security blocking writes

**Solution:**
```javascript
// Check RLS is set up correctly
// In Supabase → Table Editor → Each table → Policies

// RLS policies should look like:
// CREATE POLICY "users_can_crud_own_meetings" ON public.meetings
//   FOR INSERT, UPDATE, DELETE USING (auth.uid() = user_id);
```

### Problem 4: "Real-time not working"

**Cause:** Real-time publication disabled

**Solution:**
```sql
-- Run in Supabase SQL Editor:
-- Enable real-time on all tables:
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.timeline_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
-- ... repeat for all tables
```

Then reload app.

---

## 📊 Database Monitoring

### Check Storage Used

In Supabase Dashboard → Settings → Usage:

```
PostgreSQL Database:
├── Size: X MB (of unlimited)
├── Rows: X
└── Tables: 9
```

### Check Real-Time Activity

In Supabase Dashboard → Database → Logs:

```
Watch for:
✓ INSERT operations (when you add data)
✓ UPDATE operations (when you edit data)
✓ DELETE operations (when you remove data)
✓ Authorization errors (RLS violations)
```

---

## ✅ Success Criteria

Your Supabase setup is **correct** when:

✅ Connection test returns `true`
✅ 9 tables exist in database
✅ Each table has RLS policies
✅ Supabase Dashboard shows your data
✅ Real-time sync works (2 windows)
✅ localStorage AND Supabase both have same data
✅ No RLS permission errors
✅ Data survives browser restart

---

## 📋 Verification Checklist

### Before Going to Production

- [ ] Supabase credentials configured in supabase-config.js
- [ ] testConnection() returns true
- [ ] All 9 tables created
- [ ] RLS policies on all tables
- [ ] Real-time publication enabled
- [ ] Can add data through app
- [ ] Data appears in Supabase dashboard
- [ ] Real-time works (2 windows test)
- [ ] Data persists after page refresh
- [ ] Data persists after browser restart
- [ ] Can query data via Supabase console
- [ ] No errors in browser console

---

## 🚀 Next Steps

1. **Run the comprehensive verification test** (see above)
2. **Check Supabase dashboard** for your data
3. **Test real-time sync** with 2 windows
4. **Review logs** for any errors

Once all tests pass, your app is **properly connected to Supabase** ✅

---

**Status:** Verification Guide Ready  
**Test Time:** ~10 minutes  
**Difficulty:** Easy
