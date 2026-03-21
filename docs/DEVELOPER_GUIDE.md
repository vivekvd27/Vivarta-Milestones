# Supabase Integration - Developer Guide

**Audience:** Developers working on the Vivarta Dashboard  
**Last Updated:** March 21, 2026

---

## 📚 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  BROWSER / UI LAYER                  │
│  (index.html + existing widgets + bundle.js)        │
└────────────────────┬────────────────────────────────┘
                     │ localStorage API (intercepted)
┌────────────────────▼────────────────────────────────┐
│              SUPABASE APP BRIDGE                     │
│  (supabase-app.js)                                  │
│  - Intercepts localStorage calls                     │
│  - Routes to Supabase or cache                      │
│  - Maintains appState in memory                      │
│  - Dispatches UI events (stateChange)              │
└────────┬──────────────────┬──────────────────────────┘
         │                  │
    ┌────▼──────────┐   ┌───▼──────────────┐
    │ AUTH MANAGER  │   │  DATA SYNC LAYER │
    │ (auth.js)     │   │  (sync.js)       │
    │               │   │                  │
    │ - Login       │   │ - CRUD ops       │
    │ - Signup      │   │ - Real-time subs │
    │ - Logout      │   │ - Data fetching  │
    └────┬──────────┘   └───┬──────────────┘
         │                  │
         └────────┬─────────┘
                  │ Supabase JS Client
         ┌────────▼──────────────────┐
         │   SUPABASE CLOUD           │
         │   - PostgreSQL Database    │
         │   - Auth + Sessions        │
         │   - Real-time Subscriptions│
         │   - RLS Security           │
         └───────────────────────────┘
```

---

## 🔌 Data Flow

### Adding a New Item (e.g., Timeline Event)

```
1. User clicks "Add Event" button
   │
2. Widget calls addTimelineEvent(title, date, ...)
   │
3. Function updates appState.timeline
   │
4. Calls saveState() → localStorage.setItem("vivartaState", ...)
   │
5. localStorage interceptor fires:
   - supabase-app.js catches setItem
   - Calls syncToSupabase("timeline", [...])
   - Queries Supabase for changes
   - Calls dataSync.addItem("timeline_events", newEvent)
   │
6. Supabase inserts row → timeline_events table
   │
7. Real-time subscription fires (POST_CHANGES)
   │
8. handleRealtimeUpdate() called
   │
9. Dispatches "supabaseSync" event with type: "timeline:add"
   │
10. UI re-renders (existing stateChange listener)
```

### Real-Time Update from Another User

```
1. User B adds meeting
   │
2. Supabase inserts to meetings table
   │
3. Real-time channel triggers
   │
4. User A's handleRealtimeUpdate() fires
   │
5. Updates appState.meetings
   │
6. Dispatches event → UI updates
   │
7. User A sees new meeting WITHOUT page refresh
```

---

## 🛠️ Working with the Integration

### Adding a New Data Collection

To add a new collection (e.g., `projects`):

#### 1. Create Database Table

In Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_projects_user ON public.projects(user_id);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_crud_own_projects" ON public.projects
  FOR INSERT, UPDATE, DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
```

#### 2. Update supabase-sync.js

Add to `getDataKeyForTable()`:

```javascript
getDataKeyForTable(table) {
  const mapping = {
    // ... existing mappings
    projects: "projects",  // NEW
  };
  return mapping[table];
}
```

Add to `fetchAllData()`:

```javascript
async fetchAllData() {
  const userId = this.auth.getCurrentUserId();

  try {
    const [
      // ... existing queries
      projects,
    ] = await Promise.all([
      // ... existing
      this.supabase.from("projects").select("*").eq("user_id", userId),
    ]);

    this.syncedData = {
      // ... existing
      projects: projects.data || [],
    };
    
    return this.syncedData;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}
```

#### 3. Update supabase-app.js

Add to table mapping in `syncToSupabase()`:

```javascript
const tableMap = {
  // ... existing
  projects: "projects",  // NEW
};
```

#### 4. Use in Your Widget

```javascript
// Old way (localStorage):
function addProject(title, description) {
  const project = { 
    id: generateId(), 
    title, 
    description 
  };
  appState.projects.push(project);
  saveState();
  dispatchStateChange("projects:add", project);
}

// New way (Supabase - auto-synced):
// Same code! It still works because...
// - saveState() → localStorage.setItem intercepted
// - Supabase sync happens automatically
// - Real-time updates sync to UI

// OR direct Supabase method:
async function addProjectDirect(title, description) {
  const project = await window.supabaseApp.addItem("projects", {
    title,
    description,
  });
  // Automatically synced to all connected clients!
}
```

---

## 🔄 Event System

### Event Types

**Old Event System (Still Works!):**
```javascript
window.addEventListener("stateChange", (event) => {
  const { type, data } = event.detail;
  
  if (type === "timeline:add") {
    renderTimeline();
  } else if (type === "meetings:update") {
    renderMeetings();
  }
});
```

**New Event System (Supabase):**
```javascript
window.addEventListener("supabaseSync", (event) => {
  const { type, data } = event.detail;
  // Handle Supabase real-time updates
  // Then triggers "stateChange" for UI
});
```

### Event Format

```javascript
{
  detail: {
    type: "timeline:add",        // "collection:action"
    data: { id, title, ... },    // The affected record
    timestamp: 1711000000000     // When it happened
  }
}
```

---

## 📝 Code Examples

### Example 1: Adding Data

```javascript
// Widget code (unchanged):
async function handleAddMeeting() {
  const title = document.getElementById("meetingTitle").value;
  const date = document.getElementById("meetingDate").value;
  
  const meeting = {
    id: generateId(),
    title,
    date,
    status: "upcoming"
  };
  
  appState.meetings.push(meeting);
  saveState();  // ← This syncs to Supabase!
  dispatchStateChange("meetings:add", meeting);
  renderMeetings();
}

// OR using Supabase directly:
async function handleAddMeeting() {
  try {
    const meeting = await window.supabaseApp.addItem("meetings", {
      title: document.getElementById("meetingTitle").value,
      date: document.getElementById("meetingDate").value,
      status: "upcoming"
    });
    
    // Automatically synced and notified!
    renderMeetings();
  } catch (error) {
    showToast("Error adding meeting: " + error.message, "error");
  }
}
```

### Example 2: Deleting Data

```javascript
// Widget code (unchanged):
function handleDeleteMeeting(meetingId) {
  appState.meetings = appState.meetings.filter(m => m.id !== meetingId);
  saveState();  // ← Syncs deletion!
  dispatchStateChange("meetings:delete", { id: meetingId });
  renderMeetings();
}

// OR using Supabase directly:
async function handleDeleteMeeting(meetingId) {
  try {
    await window.supabaseApp.deleteItem("meetings", meetingId);
    // Deletion propagates via real-time!
    renderMeetings();
  } catch (error) {
    showToast("Error deleting meeting", "error");
  }
}
```

### Example 3: Real-Time Collaboration

```javascript
// Open dashboard in 2 browser windows
// Window 1: Add a meeting
addMeeting("Client call", "2026-03-25", "Product demo");

// Window 2: You'll see it appear in real-time!
// No refresh needed, no polling needed

// How it works:
// 1. Window 1 writes to Supabase
// 2. Supabase notifies all subscribed clients
// 3. Window 2's real-time listener fires
// 4. Updates appState + re-renders
// 5. User sees new meeting instantly
```

---

## 🔍 Debugging

### Enable Debug Mode

```javascript
// In browser console:
localStorage.setItem("DEBUG_SUPABASE", "true");
location.reload();

// Now you'll see detailed logs:
// - Data fetches
// - Real-time updates
// - Sync operations
// - Auth state changes
```

### Monitor Real-Time Subscriptions

```javascript
// Check active subscriptions
console.log(window.supabaseApp.dataSync.subscriptions);

// List all synced data
console.log(window.supabaseApp.dataSync.syncedData);

// Check current app state
console.log(window.supabaseApp.appState);

// Get current user
console.log(window.supabaseApp.getCurrentUserId());
```

### Check Database (Supabase Dashboard)

1. Go to Supabase project → **Table Editor**
2. View all data for current user
3. Check `updated_at` timestamp
4. Verify RLS policies allow access

---

## ⚠️ Common Pitfalls

### ❌ Don't: Create ID client-side (for Supabase)

```javascript
// WRONG - client generates ID
const meeting = {
  id: generateId(),  // Don't do this!
  title,
};
await supabaseApp.addItem("meetings", meeting);
```

✅ **Do: Let Supabase generate ID**

```javascript
// RIGHT - let Supabase create UUID
const meeting = {
  // Don't send id field
  title,
  person,
};
await supabaseApp.addItem("meetings", meeting);
```

---

### ❌ Don't: Use localStorage directly

```javascript
// WRONG - bypasses Supabase
localStorage.setItem("vivartaState", JSON.stringify(data));
```

✅ **Do: Use appState + saveState()**

```javascript
// RIGHT - routes to Supabase
appState.meetings.push(meeting);
saveState();  // Intercepted and synced!
```

---

### ❌ Don't: Assume local changes are instant

```javascript
// WRONG - may not work offline
console.log(appState.meetings);  // Old data!
```

✅ **Do: Wait for sync event**

```javascript
// RIGHT - waits for confirmation
window.addEventListener("supabaseSync", (event) => {
  if (event.detail.type === "meetings:add") {
    console.log(appState.meetings);  // Fresh data!
  }
});
```

---

## 🧪 Testing

### Unit Test Example

```javascript
// Test adding a meeting
async function testAddMeeting() {
  const before = window.supabaseApp.appState.meetings.length;
  
  await window.supabaseApp.addItem("meetings", {
    title: "Test Meeting",
    date: "2026-03-25",
    status: "upcoming"
  });
  
  const after = window.supabaseApp.appState.meetings.length;
  
  console.assert(after === before + 1, "Meeting should be added");
  console.log("✓ testAddMeeting passed");
}

// Run it:
testAddMeeting().catch(console.error);
```

### Real-Time Test

```javascript
// Test real-time sync between 2 windows
// 1. Open app in Window A
// 2. Open app in Window B
// 3. In Window A console:
function testRealTime() {
  console.log("Adding meeting...");
  window.supabaseApp.addItem("meetings", {
    title: "Real-time test",
    date: "2026-03-25"
  });
}

// 4. In Window B console:
// You should see new meeting appear within 1 second!
```

---

## 🚀 Performance Tips

### 1. Batch Operations

Instead of adding 10 items one-by-one:

```javascript
// Slow approach
for (const item of items) {
  await supabaseApp.addItem("meetings", item);
}

// Fast approach
const allItems = items.map(item => ({ 
  ...item, 
  user_id: supabaseApp.getCurrentUserId() 
}));
await supabaseApp.dataSync.supabase
  .from("meetings")
  .insert(allItems);
```

###2. Filter Early

```javascript
// Slow - fetch all, then filter
const allMeetings = appState.meetings;
const upcoming = allMeetings.filter(m => m.status === "upcoming");

// Fast - query with filter
const { data: upcoming } = await supabaseApp.dataSync.supabase
  .from("meetings")
  .select("*")
  .eq("user_id", supabaseApp.getCurrentUserId())
  .eq("status", "upcoming");
```

### 3. Pagination

For large datasets:

```javascript
async function getPagedMeetings(page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  
  const { data } = await supabaseApp.dataSync.supabase
    .from("meetings")
    .select("*")
    .eq("user_id", supabaseApp.getCurrentUserId())
    .range(offset, offset + pageSize - 1);
  
  return data;
}
```

---

## 📚 Further Reading

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Guide](https://www.postgresql.org/docs/)
- [Real-time Best Practices](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🆘 Getting Help

### In Development

1. Check console for errors
2. Enable Debug mode (see above)
3. Check browser Network tab
4. Verify Supabase dashboard

### On Production

1. Check error logs in Supabase
2. Monitor user feedback
3. Check database performance
4. Contact Supabase support

---

**Last Updated:** March 21, 2026  
**Version:** 1.0 (Production Ready)
