/**
 * APP INITIALIZATION & ORCHESTRATION
 * Main entry point for the modular dashboard application
 */

import { loadState } from "./state.js";
import {
  renderTimeline,
  initTimelineForm,
} from "./widgets/timeline.js";
import {
  renderMeetings,
  initMeetingsForm,
} from "./widgets/meetings.js";
import {
  renderContacts,
  initNetworkingForm,
} from "./widgets/networking.js";
import {
  renderFutureEvents,
  initFutureEventsForm,
} from "./widgets/futureEvents.js";

/**
 * Initialize application
 */
export function initializeApp() {
  // Load state from localStorage
  loadState();

  // Initialize all widgets
  initializeWidgets();

  // Listen for state changes
  window.addEventListener("stateChange", handleStateChange);

  console.log("✓ Vivarta dashboard initialized with modular widgets");
}

/**
 * Initialize all dashboard widgets
 */
function initializeWidgets() {
  // Timeline
  renderTimeline();
  initTimelineForm();

  // Meetings
  renderMeetings();
  initMeetingsForm();

  // Networking/Contacts
  renderContacts();
  initNetworkingForm();

  // Future Events
  renderFutureEvents();
  initFutureEventsForm();
}

/**
 * Handle state change events
 */
function handleStateChange(event) {
  const { type, data } = event.detail;

  // Log state changes (optional)
  // console.log("State changed:", type, data);

  // Re-render affected widgets based on change type
  if (type.startsWith("timeline:")) {
    renderTimeline();
  } else if (type.startsWith("meetings:")) {
    renderMeetings();
  } else if (type.startsWith("contacts:")) {
    renderContacts();
  } else if (type.startsWith("futureEvents:")) {
    renderFutureEvents();
  }
}

/**
 * Auto-initialize on DOM ready
 */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
