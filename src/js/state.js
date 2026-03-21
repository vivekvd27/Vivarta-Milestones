/**
 * GLOBAL STATE MANAGEMENT
 * Central state store for Vivarta dashboard
 * Persisted to localStorage
 */

export const appState = {
  // Timeline Events
  timeline: [],
  
  // Meetings Tracker
  meetings: [],
  
  // Networking CRM Contacts
  contacts: [],
  
  // Future Events / Preparation
  futureEvents: [],
};

/**
 * Save entire state to localStorage
 */
export function saveState() {
  try {
    localStorage.setItem("vivartaState", JSON.stringify(appState));
  } catch (error) {
    console.error("Error saving state:", error);
  }
}

/**
 * Load state from localStorage
 */
export function loadState() {
  try {
    const data = JSON.parse(localStorage.getItem("vivartaState") || "{}");
    if (data.timeline) appState.timeline = data.timeline;
    if (data.meetings) appState.meetings = data.meetings;
    if (data.contacts) appState.contacts = data.contacts;
    if (data.futureEvents) appState.futureEvents = data.futureEvents;
  } catch (error) {
    console.error("Error loading state:", error);
  }
}

/**
 * Generate unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Get current date formatted as YYYY-MM-DD
 */
export function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Format date for display
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get days remaining until date
 */
export function daysUntil(dateStr) {
  const today = new Date();
  const target = new Date(dateStr + "T00:00:00");
  const diff = target - today;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
}

/**
 * Show toast notification
 */
export function showToast(message, type = "success") {
  const container = document.querySelector(".toast-container") || createToastContainer();
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => toast.classList.add("show"), 10);
  
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Create toast container if it doesn't exist
 */
function createToastContainer() {
  const container = document.createElement("div");
  container.className = "toast-container";
  document.body.appendChild(container);
  return container;
}

/**
 * Dispatch custom event for state changes
 */
export function dispatchStateChange(type, data) {
  window.dispatchEvent(
    new CustomEvent("stateChange", {
      detail: { type, data, timestamp: Date.now() },
    })
  );
}
