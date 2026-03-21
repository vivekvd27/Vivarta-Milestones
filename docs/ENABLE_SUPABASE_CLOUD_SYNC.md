# Enable Supabase Cloud Sync

**Current Status:** Your app is configured to use **Supabase cloud mode** for real-time data sync across all devices.

## Quick Setup (5 minutes)

### Step 1: Create the Database Table
1. Go to your Supabase Project: [Supabase Dashboard](https://app.supabase.com)
2. Click on **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the contents from `docs/SUPABASE_USER_DATA_TABLE.sql`
5. Click **Run** to execute

**Expected result:** Message saying `Query successful`

### Step 2: Test the Connection
1. Open your Vercel app: [https://vivarta-milestones.vercel.app](https://vivarta-milestones.vercel.app)
2. Select a user (Vivek, Mirat, or Chirag)
3. Open **Developer Console** (F12 → Console tab)
4. Look for these messages:
   - ✓ `✓ Supabase mode initialized for user: [Name]`
   - ✓ `📥 Loaded data from Supabase for [Name]`
   - ✓ `✓ Dashboard ready for [Name] (Supabase cloud)`

### Step 3: Add a Task and Verify Sync
1. Add a task in the Rule of 3 widget: "Test Task"
2. Check the console for: `☁️  Synced to Supabase`
3. Go to Supabase Dashboard → **Table Editor**
4. Click on **user_data** table
5. You should see your data stored there!

### Step 4: Cross-Device Test
1. **Desktop:** Add a task for Vivek
2. **iPad:** Open the same Vercel app and select Vivek
3. The task should appear automatically ✨

---

## Troubleshooting

### ❌ Error: "relation 'user_data' does not exist"
**Solution:** The table hasn't been created yet.
- Re-run the SQL from **Step 1** above
- Verify in Supabase: SQL Editor → select all from user_data

### ❌ Data not syncing across devices
**Possible causes:**
1. Table not created (see above)
2. User selected different names on each device
   - Always use exact names: **Vivek**, **Mirat**, **Chirag**
3. Try refreshing the page after selecting user

### ❌ "Supabase client not available" error
**Solution:** Check that Supabase scripts loaded:
1. Open DevTools → Console
2. Type: `window.supabaseConfig` (should show config object)
3. Check Network tab for: `supabase.min.js` (should be blue/200)

### ✅ Still seeing "localStorage" mode?
**Solution:** The app fell back to demo mode because:
1. Table doesn't exist - create it (Step 1)
2. Credential mismatch - ensure .env has correct SUPABASE_URL and SUPABASE_ANON_KEY
3. Supabase down - check [status.supabase.com](https://status.supabase.com)

---

## Architecture

```
Desktop (Vivek)                    iPad (Vivek)
    ↓                                  ↓
Select Vivek              →          Select Vivek
    ↓                                  ↓
Load from Supabase        ←→→→→→→→    Load from Supabase
    ↓                                  ↓
Check "Finish Work A"               Dashboard shows
    ↓                                empty list initially
Save to Supabase                           ↓
    ↓                          Real-time update
Send WebSocket update     ←→→→→→→→   Receive checkin
    ↓                                  ↓
iPad receives push                  "Finish Work A" 
notification                        now checked ✓
```

---

## Data Flow

1. **When you check a task:**
   ```javascript
   // bundle.js calls
   saveState()
   ↓
   localStorage.setItem("vivartaState", {...})
   ↓
   supabase-app.js intercepts
   ↓
   Upserts to Supabase user_data table
   ↓
   Real-time subscription fires on other devices
   ↓
   UI updates automatically
   ```

2. **When you open app on new device:**
   ```javascript
   // supabase-app.js loads state
   SELECT * FROM user_data WHERE user_name = 'Vivek'
   ↓
   Parse state_json
   ↓
   Populate appState
   ↓
   Dashboard renders with synced data
   ↓
   Real-time listener activated
   ```

---

## Disabling Cloud Sync (Back to Demo Mode)

If you want to use localStorage only (no Supabase):

**Edit `src/js/supabase-app.js` line 14:**
```javascript
this.demoMode = true;  // Change from false to true
```

Then redeploy. Data will save locally only (no cross-device sync).

---

## Next Steps

✅ **Create table** → Run SQL from Step 1  
✅ **Test locally** → Add task and check Supabase table  
✅ **Test cross-device** → Open on iPad and verify sync  
✅ **Deploy** → Run `vercel deploy` to push changes  

---

## Support

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Vivarta Docs:** Check `docs/` folder for more guides
- **Check Console:** Always look at F12 console for detailed logs

