# Vivarta Dashboard - Modular Architecture

## Overview

The Vivarta Dashboard has been refactored into a clean, modular architecture using ES Modules. This enables scalability, maintainability, and the addition of new widgets without affecting existing functionality.

---

## Project Structure

```
vivarta-milestones/
├── public/
│   └── index.html                 (Main HTML file - entry point)
├── src/
│   ├── css/
│   │   ├── base.css              (Core/inherited styles from index.html)
│   │   ├── dashboard.css         (Dashboard-specific styles)
│   │   └── widgets.css           (Widget component styles)
│   └── js/
│       ├── app.js                (App initialization & orchestration)
│       ├── state.js              (Global state management)
│       ├── utils.js              (Utility functions)
│       └── widgets/
│           ├── timeline.js       (Timeline of Events widget)
│           ├── meetings.js       (Meetings Tracker widget)
│           ├── networking.js     (Networking CRM widget)
│           └── futureEvents.js   (Future Events / Preparation widget)
└── README.md                      (This file)
```

---

## Module Details

### 1. **state.js** - Global State Management
Centralized state store persisted to localStorage.

**Exported Functions:**
- `appState` - Central state object containing:
  - `timeline[]` - Timeline events
  - `meetings[]` - Meeting records
  - `contacts[]` - Networking contacts
  - `futureEvents[]` - Future events
- `saveState()` - Persist state to localStorage
- `loadState()` - Load state from localStorage
- `generateId()` - Create unique IDs
- `getTodayDate()` - Get current date (YYYY-MM-DD)
- `formatDate(dateStr)` - Format date for display
- `daysUntil(dateStr)` - Calculate days remaining
- `showToast(message, type)` - Display toast notifications
- `dispatchStateChange(type, data)` - Emit state change events

### 2. **utils.js** - Utility Functions
Helper functions for DOM manipulation and formatting.

**Exported Functions:**
- `createElement(tag, className, innerHTML)` - Create DOM elements
- `formatDateShort(dateStr)` - Format date relative to today
- `getPriorityColor(priority)` - Get color for priority levels
- `getEventTypeStyle(type)` - Get styles for event types
- `getMeetingStatusBadge(status)` - Create status badge HTML
- `clearChildren(element)` - Remove all child elements
- `debounce(func, wait)` - Debounce function
- `escapeHtml(text)` - Prevent XSS by escaping HTML

### 3. **Widgets** - Individual Components

#### **timeline.js** - Timeline of Events
Track and visualize major/minor events on a vertical timeline.

**Key Functions:**
- `addTimelineEvent(title, description, date, type)` - Add event
- `deleteTimelineEvent(eventId)` - Remove event
- `renderTimeline()` - Render timeline widget
- `initTimelineForm()` - Initialize form

**Data Structure:**
```javascript
{
  id: "unique-id",
  title: "Event Title",
  description: "Optional description",
  date: "2026-03-21",
  type: "major" | "minor",
  createdAt: "ISO-8601 timestamp"
}
```

#### **meetings.js** - Meetings Tracker
Track past and upcoming meetings with people.

**Key Functions:**
- `addMeeting(title, person, date, notes)` - Add meeting
- `toggleMeetingStatus(meetingId)` - Mark as done/undone
- `deleteMeeting(meetingId)` - Remove meeting
- `getMeetingsByStatus(status)` - Filter by status
- `renderMeetings()` - Render widget
- `initMeetingsForm()` - Initialize form

**Data Structure:**
```javascript
{
  id: "unique-id",
  title: "Meeting Title",
  person: "Person Name",
  date: "2026-03-21",
  notes: "Meeting notes",
  status: "upcoming" | "completed",
  createdAt: "ISO-8601 timestamp"
}
```

#### **networking.js** - Networking CRM
Build and manage a professional network.

**Key Functions:**
- `addContact(name, role, company, notes)` - Add contact
- `updateContactLastInteraction(contactId)` - Update last contact date
- `deleteContact(contactId)` - Remove contact
- `searchContacts(query)` - Search by name/company/role
- `renderContacts()` - Render widget with search
- `initNetworkingForm()` - Initialize form

**Data Structure:**
```javascript
{
  id: "unique-id",
  name: "Person Name",
  role: "Job Title",
  company: "Company Name",
  notes: "Notes about interaction",
  lastContact: "2026-03-21",
  createdAt: "ISO-8601 timestamp"
}
```

#### **futureEvents.js** - Future Events & Preparation
Track upcoming important events with priority and urgency.

**Key Functions:**
- `addFutureEvent(title, date, notes, priority)` - Add event
- `deleteFutureEvent(eventId)` - Remove event
- `getFutureEvents()` - Get sorted by urgency
- `getEventsByPriority(priority)` - Filter by priority
- `renderFutureEvents()` - Render widget
- `initFutureEventsForm()` - Initialize form

**Data Structure:**
```javascript
{
  id: "unique-id",
  title: "Event Title",
  date: "2026-03-21",
  preparationNotes: "Prep checklist",
  priority: "high" | "medium" | "low",
  createdAt: "ISO-8601 timestamp"
}
```

### 4. **app.js** - Application Initialization
Orchestrates app initialization and event handling.

**Key Functions:**
- `initializeApp()` - Entry point for app startup
- `initializeWidgets()` - Initialize all dashboard widgets
- `handleStateChange(event)` - React to state changes
- Auto-initializes when DOM is ready

---

## CSS Architecture

### base.css (Inherited)
Contains all existing styles from index.html (not moved, kept for backward compatibility).

### dashboard.css
Dashboard-specific styles for:
- Widget card containers
- Widget headers and icons
- Dashboard grid layout
- Responsive behavior

### widgets.css
Widget component styles:
- Timeline events
- Meeting cards
- Contact cards
- Future event cards
- Form inputs
- Animations

---

## Data Persistence

All widget data is automatically saved to localStorage under the key `"vivartaState"`.

**Example localStorage structure:**
```json
{
  "vivartaState": {
    "timeline": [
      { "id": "...", "title": "...", "date": "2026-03-21", "type": "major", ... }
    ],
    "meetings": [
      { "id": "...", "title": "...", "person": "...", "status": "upcoming", ... }
    ],
    "contacts": [
      { "id": "...", "name": "...", "role": "...", "company": "...", ... }
    ],
    "futureEvents": [
      { "id": "...", "title": "...", "date": "2026-03-21", "priority": "high", ... }
    ]
  }
}
```

---

## Event System

Widgets emit custom events when state changes. Listen with:

```javascript
window.addEventListener('stateChange', (event) => {
  const { type, data } = event.detail;
  // type: "timeline:add", "timeline:delete", "meetings:toggle", etc.
  // data: the modified item
});
```

---

## How to Add a New Widget

1. **Create widget module** at `src/js/widgets/newWidget.js`:
   ```javascript
   import { appState, generateId, saveState, dispatchStateChange } from "../state.js";
   
   export function addItem(data) {
     const item = { id: generateId(), ...data };
     appState.myNewWidget = appState.myNewWidget || [];
     appState.myNewWidget.push(item);
     saveState();
     dispatchStateChange('myWidget:add', item);
   }
   
   export function renderWidget() {
     // Render to DOM
   }
   ```

2. **Add state property** in `state.js`:
   ```javascript
   export const appState = {
     // ... existing
     myNewWidget: [],
   };
   ```

3. **Import and initialize** in `app.js`:
   ```javascript
   import { renderWidget, initForm } from "./widgets/newWidget.js";
   
   function initializeWidgets() {
     // ... existing
     renderWidget();
     initForm();
   }
   ```

4. **Add HTML** in `index.html` dashboard grid

5. **Add styles** in `src/css/widgets.css`

---

## Existing Functionality Preserved

✅ Habit Tracker (Day/Week/Month/Year views)
✅ Goals System (Yearly/Monthly/Weekly)
✅ Affirmations Section
✅ Manifestations Board
✅ Multi-person tracking (Vivek/Mirat/Chirag)
✅ Theme toggle (Light/Dark)
✅ Import/Export functionality
✅ Dashboard with core metrics

---

## Browser Compatibility

- Requires ES Modules support (modern browsers)
- Modern JavaScript (ES6+)
- localStorage API

---

## Future Enhancements

- [ ] IndexedDB for larger data sets
- [ ] Cloud sync with backend
- [ ] Real-time collaboration
- [ ] Advanced analytics
- [ ] Custom widget creation
- [ ] Plugin system
- [ ] API endpoints

---

## Development Notes

- All widget functions are pure and side-effect free
- State changes are immutable (new objects, not mutations)
- DOM manipulation is centralized in render functions
- Modal dialogs are managed in index.html with vanilla JS
- No dependencies - vanilla JavaScript only

---

## Support

For issues or questions about the modular architecture:
1. Check the widget's JSDoc comments
2. Review state.js and utils.js
3. Test in browser console: `console.log(appState)`
4. Verify localStorage: `localStorage.getItem('vivartaState')`
