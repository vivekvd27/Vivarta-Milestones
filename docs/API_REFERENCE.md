# Supabase Integration - API Reference

**Quick Reference for All Public Methods**

---

## 📦 Main Entry Point: `window.supabaseApp`

All Supabase functionality accessible via `window.supabaseApp`

---

## 🔐 Authentication Methods

### `getCurrentUser()`
Returns the current authenticated user object

```javascript
const user = window.supabaseApp.getCurrentUser();
// Returns: { id: "uuid", email: "user@example.com", app_metadata: {}, user_metadata: {} }
// or: null if not authenticated
```

### `getCurrentUserId()`
Returns current user's UUID

```javascript
const userId = window.supabaseApp.getCurrentUserId();
// Returns: "550e8400-e29b-41d4-a716-446655440000"
// or: null if not authenticated
```

### `signIn(email, password)`
Authenticate with email/password

```javascript
try {
  const user = await window.supabaseApp.signIn("user@example.com", "password123");
  console.log("Logged in as:", user.email);
} catch (error) {
  console.error("Sign in failed:", error.message);
}
```

### `signUp(email, password, displayName)`
Create new account

```javascript
try {
  const user = await window.supabaseApp.signUp(
    "newuser@example.com",
    "password123",
    "John Doe"
  );
  console.log("Account created:", user.id);
} catch (error) {
  console.error("Sign up failed:", error.message);
  // Common: "User already registered"
}
```

### `signOut()`
Logout current user

```javascript
await window.supabaseApp.signOut();
// Clears session, unsubscribes from real-time
// Redirects to login screen
```

### `resetPassword(email)`
Send password reset email

```javascript
try {
  await window.supabaseApp.resetPassword("user@example.com");
  console.log("Reset email sent");
} catch (error) {
  console.error("Failed:", error.message);
}
```

---

## 📊 Data Operations

### `addItem(table, data)`
Create new record

```javascript
const meeting = await window.supabaseApp.addItem("meetings", {
  title: "Client Call",
  date: "2026-03-25",
  person: "John Doe",
  status: "scheduled"
});

// Returns: { id: "uuid", user_id: "...", ...data, created_at: "...", updated_at: "..." }
```

**Supported tables:**
- `timeline_events`
- `meetings`
- `contacts`
- `future_events`
- `rule_of_three_tasks`
- `affirmations`
- `goals`
- `announcements`
- `milestones`

### `updateItem(table, id, data)`
Update existing record

```javascript
const updated = await window.supabaseApp.updateItem("meetings", meetingId, {
  status: "completed",
  notes: "Great discussion"
});

// Returns: updated record
```

### `deleteItem(table, id)`
Delete record

```javascript
const deleted = await window.supabaseApp.deleteItem("meetings", meetingId);

// Returns: deleted record
// Throws error if not found
```

### `getItem(table, id)` ⚠️ NOT IMPLEMENTED
Use `appState` instead:

```javascript
// ✓ CORRECT:
const meeting = window.supabaseApp.appState.meetings.find(m => m.id === id);

// ✗ WRONG:
// const meeting = await window.supabaseApp.getItem("meetings", id);
```

---

## 🔄 Data Sync

### `appState`
In-memory app state (synced from Supabase)

```javascript
// View all data:
console.log(window.supabaseApp.appState);
// {
//   timeline: [...],
//   meetings: [...],
//   contacts: [...],
//   futureEvents: [...],
//   ruleOfThree: [...],
//   affirmations: [...],
//   goals: [...],
//   announcements: [...],
//   milestones: [...]
// }

// Access specific collection:
const meetings = window.supabaseApp.appState.meetings;

// Add to appState (changes auto-synced to Supabase):
appState.meetings.push(newMeeting);
saveState();  // Triggers sync
```

### `dataSync.initialize()`
Fetch all data and subscribe to real-time

```javascript
try {
  await window.supabaseApp.dataSync.initialize();
  console.log("Data loaded and subscribed");
} catch (error) {
  console.error("Initialization failed:", error);
}
```

### `dataSync.syncedData`
Raw data fetched from Supabase

```javascript
console.log(window.supabaseApp.dataSync.syncedData);
// {
//   timeline_events: [...],
//   meetings: [...],
//   contacts: [...],
//   ...
// }
```

### `dataSync.subscriptions`
Active real-time subscriptions

```javascript
console.log(window.supabaseApp.dataSync.subscriptions);
// Should be 9 subscription channels (one per table)
// If empty, real-time not working
```

---

## 🎯 User Profile

### `getUserProfile(userId)`
Get user's profile record

```javascript
const profile = await window.supabaseApp.dataSync.getUserProfile(
  "550e8400-e29b-41d4-a716-446655440000"
);

// Returns: { id, user_id, email, display_name, created_at, updated_at }
```

### `updateUserProfile(displayName, settings)`
Update profile information

```javascript
const updated = await window.supabaseApp.dataSync.updateUserProfile(
  "New Name",
  { theme: "dark", language: "en" }
);
```

---

## 🌐 Supabase Client

Direct access to Supabase client for advanced queries:

```javascript
const supabase = window.supabaseApp.dataSync.supabase;

// Example: Complex query
const { data, error } = await supabase
  .from("meetings")
  .select("*")
  .eq("user_id", window.supabaseApp.getCurrentUserId())
  .eq("status", "completed")
  .order("date", { ascending: false })
  .limit(10);

console.log(data, error);
```

---

## 📡 Events

### `stateChange` Event
Fires when app state changes (existing system)

```javascript
window.addEventListener("stateChange", (event) => {
  const { type, data } = event.detail;
  
  if (type === "timeline:add") {
    console.log("Timeline event added:", data);
  }
});
```

### `supabaseSync` Event
Fires when Supabase real-time updates received

```javascript
window.addEventListener("supabaseSync", (event) => {
  const { type, data, timestamp } = event.detail;
  
  if (type === "meetings:add") {
    console.log("New meeting from other user:", data);
  }
});

// Event types: collection:action
// Examples:
// - meetings:add
// - timeline:update
// - contacts:delete
// - affirmations:add
```

---

## 🔧 Advanced: Direct Supabase Queries

Access Supabase client for custom operations:

```javascript
const client = window.supabaseApp.dataSync.supabase;

// SELECT
const { data, error } = await client
  .from("timeline_events")
  .select("*")
  .eq("user_id", userId)
  .order("date", { ascending: false })
  .limit(100);

// INSERT
const { data: inserted, error: insertError } = await client
  .from("meetings")
  .insert([{ title: "Meeting", user_id: userId, date: "2026-03-25" }]);

// UPDATE
const { data: updated, error: updateError } = await client
  .from("contacts")
  .update({ phone: "555-1234" })
  .eq("id", contactId)
  .eq("user_id", userId);

// DELETE
const { data: deleted, error: deleteError } = await client
  .from("goals")
  .delete()
  .eq("id", goalId)
  .eq("user_id", userId);

// Real-time subscription
const subscription = client
  .on("postgres_changes", 
    { event: "*", schema: "public", table: "affirmations" },
    (payload) => console.log("Change received!", payload)
  )
  .subscribe();

// Unsubscribe
client.removeChannel(subscription);
```

---

## 🧮 Query Examples

### Example 1: Get User's Meetings
```javascript
const meetings = window.supabaseApp.appState.meetings
  .filter(m => m.user_id === window.supabaseApp.getCurrentUserId());
```

### Example 2: Find by Property
```javascript
const affirmation = window.supabaseApp.appState.affirmations
  .find(a => a.id === "some-uuid");
```

### Example 3: Filter and Sort
```javascript
const upcomingEvents = window.supabaseApp.appState.futureEvents
  .filter(e => new Date(e.date) > new Date())
  .sort((a, b) => new Date(a.date) - new Date(b.date));
```

### Example 4: Count Items
```javascript
const meetingCount = window.supabaseApp.appState.meetings.length;
const goalCount = window.supabaseApp.appState.goals.length;
```

### Example 5: Batch Operations
```javascript
const newMeetings = [
  { title: "Meeting 1", date: "2026-03-25", person: "John" },
  { title: "Meeting 2", date: "2026-03-26", person: "Jane" },
  { title: "Meeting 3", date: "2026-03-27", person: "Bob" }
];

// Add all to appState
newMeetings.forEach(m => window.supabaseApp.appState.meetings.push(m));
saveState();  // Syncs all changes
```

---

## ⚙️ Configuration

### `supabaseConfig`
Access Supabase configuration

```javascript
console.log(window.supabaseConfig);
// {
//   supabase: <Client>,
//   SUPABASE_URL: "https://...",
//   SUPABASE_ANON_KEY: "...",
//   testConnection: <function>
// }

// Test connection:
const isConnected = await window.supabaseConfig.testConnection();
console.log("Connected to Supabase:", isConnected);
```

---

## 🧪 Testing Helpers

### Check Initialization Status

```javascript
// Is app fully initialized?
console.log(!!window.supabaseApp?.auth?.getCurrentUser());

// Are subscriptions active?
console.log(window.supabaseApp?.dataSync?.subscriptions?.length === 9);

// Is data loaded?
console.log(Object.keys(window.supabaseApp?.appState || {}).length > 0);
```

### Debug Mode

```javascript
// Enable detailed logging:
localStorage.setItem("DEBUG_SUPABASE", "true");
location.reload();

// Disable:
localStorage.removeItem("DEBUG_SUPABASE");
```

### Monitor Performance

```javascript
// Measure operation time:
console.time("operation");
await window.supabaseApp.addItem("meetings", { title: "Test" });
console.timeEnd("operation");
// Should see: "operation: 234ms"
```

---

## 🚫 Common Mistakes

### ❌ Wrong: Using undefined methods

```javascript
// These don't exist:
window.supabaseApp.getItem(...)           // ❌
window.supabaseApp.removeItem(...)        // ❌
window.supabaseApp.clearAll(...)          // ❌
window.supabaseApp.getCollectionSize(...) // ❌
```

### ❌ Wrong: Direct localStorage

```javascript
// Don't do this - bypasses Supabase:
localStorage.setItem("vivartaState", JSON.stringify(data));
```

### ✅ Correct: Use appState + saveState()

```javascript
// Do this instead:
appState.meetings.push(meeting);
saveState();  // Auto-synced to Supabase
```

---

## 📋 Method Summary Table

| Method | Async | Returns | Purpose |
|--------|-------|---------|---------|
| `getCurrentUser()` | ❌ | User \| null | Get current user |
| `getCurrentUserId()` | ❌ | UUID \| null | Get user ID |
| `signIn(email, pw)` | ✅ | User | Login |
| `signUp(email, pw, name)` | ✅ | User | Create account |
| `signOut()` | ✅ | void | Logout |
| `addItem(table, data)` | ✅ | Record | Create item |
| `updateItem(table, id, data)` | ✅ | Record | Update item |
| `deleteItem(table, id)` | ✅ | Record | Delete item |
| `resetPassword(email)` | ✅ | void | Send reset email |

---

## 🎓 Typical Usage Pattern

```javascript
// 1. Check if user logged in
if (!window.supabaseApp.getCurrentUser()) {
  // Show login - but this happens automatically!
  return;
}

// 2. Access data from appState
const meetings = window.supabaseApp.appState.meetings;

// 3. Add new item
const newMeeting = await window.supabaseApp.addItem("meetings", {
  title: "Team Standup",
  date: "2026-03-25",
  person: "Engineering Team"
});

// 4. Listen for changes
window.addEventListener("supabaseSync", (event) => {
  if (event.detail.type === "meetings:add") {
    renderMeetings();  // Re-render UI
  }
});

// 5. Update item
await window.supabaseApp.updateItem("meetings", newMeeting.id, {
  status: "completed"
});

// 6. Delete item
await window.supabaseApp.deleteItem("meetings", newMeeting.id);
```

---

## 📚 Related Documentation

- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Architecture and patterns
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and fixes
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Initial setup instructions
- [SUPABASE_SCHEMA.sql](SUPABASE_SCHEMA.sql) - Database schema

---

**Last Updated:** March 21, 2026  
**Version:** 1.0  
**Status:** Production Ready
