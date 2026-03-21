# Supabase Integration Setup Guide

**Updated:** March 21, 2026  
**Status:** Production-Ready  

---

## 🚀 Quick Start

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create new organization
4. Create new project:
   - **Name:** `vivarta-dashboard`
   - **Database Password:** Save securely
   - **Region:** Choose closest to your users
   - **Pricing:** Choose your plan

### Step 2: Get Credentials

After project creation:

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **Anon Public Key** → `SUPABASE_ANON_KEY`

### Step 3: Setup Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Create new query
3. Copy & paste entire contents of `docs/SUPABASE_SCHEMA.sql`
4. Click **Run** ✓

### Step 4: Update Configuration

Edit `src/js/supabase-config.js`:

```javascript
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
```

### Step 5: Enable Authentication

In Supabase dashboard:

1. Go to **Authentication** → **Providers**
2. Enable **Email** (enabled by default)
3. Go to **Email Templates** and customize if needed

### Step 6: Test

1. Start your local server: `python -m http.server 8000`
2. Open `http://localhost:8000`
3. You should see login screen
4. Create test account
5. Dashboard should load with Supabase backend

---

## 🔑 Configuration

### Environment Variables (Recommended)

For production, use environment variables instead of hardcoding:

```javascript
// supabase-config.js
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "https://default.supabase.co";
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "default-key";
```

### Security Best Practices

1. **Never commit** `SUPABASE_ANON_KEY` if using it in frontend
   - It's public-facing and that's safe (uses RLS)
   - But still don't commit it - use `.env` files

2. **Enable RLS** (Row Level Security)
   - ✓ Already configured in schema
   - Users can only see their own data

3. **Use HTTPS** in production
   - Required for Supabase auth

4. **Rate Limiting**
   - Configure in Supabase project settings

---

## 📊 Database Schema Overview

### Tables Created

All tables include:
- **user_id** - Links to authenticated user
- **created_at** - Timestamp of creation
- **updated_at** - Timestamp of last update
- **RLS Policies** - Users can only access their data

### Data Collections

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `profiles` | User info | name, email, avatar_url |
| `timeline_events` | Important milestones | title, date, type |
| `meetings` | Scheduled calls | title, person, date, status |
| `contacts` | Networking CRM | name, role, company |
| `future_events` | Event prep | title, date, priority |
| `rule_of_three_tasks` | Daily 3 tasks | task_text, person, date |
| `affirmations` | Affirmations list | text, category, display_order |
| `goals` | Goals at all levels | type, text, completed |
| `announcements` | Dashboard news | title, description |
| `milestones` | Project milestones | title, status, due_date |

---

## 🔄 Real-Time Sync

### Enabled by Default

Real-time updates work automatically:

1. User A adds meeting → Supabase database updates
2. Real-time subscription fires → User's UI updates
3. Other users see update in real-time (if viewing same data)

### How It Works

1. **Change in database** → Supabase detects change
2. **Broadcast to subscribed clients** → All listening clients notified
3. **Update in-memory state** → `appState` updated
4. **Dispatch event** → UI re-renders via existing event system

### Monitor Real-Time

Watch browser console:

```
Real-time update on timeline_events: { new: {...}, old: {...}, eventType: "INSERT" }
```

---

## 👥 Multi-User Support

### How It Works

Each user is **completely isolated**:

1. **Signup/Login** → User gets unique ID
2. **All data filtered** → `user_id = current_user.id`
3. **No cross-user data** → Only see your own data

### Teams / Shared Data (Future)

To add shared data between Vivek, Mirat, Chirag:

1. Create `team_memberships` table
2. Create `shared_projects` table
3. Update RLS policies for shared access

Example policy:
```sql
-- Users can view projects they're member of
CREATE POLICY "users_can_view_shared_projects" ON public.projects
  FOR SELECT USING (
    id IN (SELECT project_id FROM team_memberships WHERE user_id = auth.uid())
  );
```

---

## 📱 Authentication

### Login Flow

1. User enters email/password
2. Supabase authenticates
3. Returns JWT token (stored securely)
4. Token auto-refreshed before expiry

### Sign Up

1. New user enters email/password
2. Supabase creates auth user
3. We create profile record
4. User auto-logs in

### Logout

1. Clears session
2. Unsubscribes from real-time
3. Redirects to login

### Session Management

- Sessions persist across browser restarts
- Tokens auto-refresh
- Session check every 30 minutes

---

## 🔌 Integration with Existing App

### How localStorage Is Replaced

**Before (localStorage):**
```javascript
const data = JSON.parse(localStorage.getItem("vivartaState"));
localStorage.setItem("vivartaState", JSON.stringify(updated));
```

**After (Supabase):**
```javascript
// Existing code stays the same!
// supabase-app.js intercepts localStorage calls
// Routes to Supabase automatically
// UI works unchanged
```

### Backward Compatibility

✅ All existing widget code works unchanged  
✅ Event system (dispatchStateChange) maintained  
✅ UI components don't need modification  
✅ localStorage still used as cache/fallback

---

## 🧪 Testing

### Test Checklist

- [ ] Login with new account
- [ ] Add timeline event
- [ ] Edit meeting
- [ ] Delete contact
- [ ] Real-time update (open 2 browser tabs)
- [ ] Refresh page - data persists
- [ ] Logout & login - data still there
- [ ] Multiple users - no data leakage

### Debug Console

Enable debug logging:

```javascript
// In browser console
localStorage.setItem("debug", "supabase:*");
```

Watch for errors:
- `Auth initialization error` → Check credentials
- `Fetch all data error` → Check RLS policies
- `Real-time update` → Verify subscription

---

## 🚨 Troubleshooting

### "supabase is not defined"

**Problem:** Supabase CDN didn't load  
**Fix:** Check internet connection, CDN availability

### "No active session"

**Problem:** User not authenticated  
**Fix:** Signup first, or clear cookies: `localStorage.clear()`

### "Row level security (RLS) policy violation"

**Problem:** RLS policies not allowing operation  
**Fix:** Check RLS policy in Supabase dashboard

### Real-time updates not working

**Problem:** Subscription failed  
**Fix:** Check that realtime is enabled for tables

```sql
-- In SQL editor, run:
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
```

### Slow performance

**Problem:** Too many queries  
**Fix:**
1. Use indexes (already created)
2. Batch operations
3. Reduce real-time subscription overhead

---

## 📈 Performance

### Query Optimization

- All tables indexed by `user_id`
- Queries filtered by user first
- Real-time only for current user

### Data Limits

- No hard limit on data rows
- Unlimited free tier for development
- Production plan: check Supabase pricing

### Caching Strategy

1. **In-memory cache** (`appState`)
2. **localStorage** (fallback if Supabase down)
3. **Real-time sync** (background)

---

## 🔐 Security

### Row Level Security (RLS)

✓ Every table has RLS enabled  
✓ Users can only access own data  
✓ Prevents SQL injection  
✓ Cannot bypass with SQL

Example policy:
```sql
CREATE POLICY "users_can_view_own_meetings" ON public.meetings
  FOR SELECT USING (auth.uid() = user_id);
```

### Auth Security

- ✓ Passwords hashed by Supabase
- ✓ JWT tokens short-lived (1 hour)
- ✓ Refresh tokens secure
- ✓ Email verification available

### Data Privacy

- ✓ No user data shared across apps
- ✓ No third-party data brokers
- ✓ GDPR compliant
- ✓ Data encryption in transit (HTTPS)

---

## 🔄 Migration from localStorage

### One-Time Migration Script

For existing users with localStorage data:

```javascript
// Run in console to migrate data
async function migrateToSupabase() {
  const oldData = JSON.parse(localStorage.getItem("vivartaState") || "{}");
  
  // Migrate each collection
  for (const event of oldData.timeline || []) {
    await window.supabaseApp.addItem("timeline", event);
  }
  
  for (const meeting of oldData.meetings || []) {
    await window.supabaseApp.addItem("meetings", meeting);
  }
  
  // ... repeat for other collections
  
  console.log("Migration complete!");
}

migrateToSupabase();
```

---

## 📞 Support

### Supabase Docs
- https://supabase.com/docs

### Community
- Discord: https://discord.supabase.io
- GitHub: https://github.com/supabase/supabase

### Issues

**App not loading?**
1. Check browser console for errors
2. Verify Supabase credentials
3. Check internet connection

**Data not syncing?**
1. Check Supabase Real-time is enabled
2. Verify RLS policies
3. Check browser cache

---

## 📋 Deployment Checklist

- [ ] Supabase project created
- [ ] Database schema loaded
- [ ] Credentials configured
- [ ] Email auth enabled
- [ ] Real-time enabled for all tables
- [ ] RLS policies verified
- [ ] Custom domain configured (optional)
- [ ] Backup enabled
- [ ] Monitoring configured

---

## Next Steps

1. **Setup Database** - Follow steps 1-5 above
2. **Test Locally** - Run and test authentication
3. **Deploy to Production** - Use same Supabase project
4. **Add Team Features** - Shared projects, team roles
5. **Monitor & Optimize** - Track performance, user metrics

---

**Status:** ✅ Ready for production  
**Last Updated:** March 21, 2026  
**Maintained by:** Vivarta Tech Team
