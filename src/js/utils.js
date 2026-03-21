/**
 * UTILITY FUNCTIONS
 * Helper functions for DOM manipulation and common operations
 */

/**
 * Create a DOM element with classes and attributes
 */
export function createElement(tag, className, innerHTML = "") {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}

/**
 * Format date to readable string
 */
export function formatDateShort(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = date - today;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 0) return `In ${days} days`;
  if (days < 0) return `${Math.abs(days)} days ago`;
  
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

/**
 * Get priority color
 */
export function getPriorityColor(priority) {
  const colors = {
    high: "var(--red)",
    medium: "var(--gold)",
    low: "var(--accent2)",
  };
  return colors[priority] || "var(--text3)";
}

/**
 * Get event type badge style
 */
export function getEventTypeStyle(type) {
  if (type === "major") {
    return { background: "var(--accent-light)", color: "var(--accent)" };
  }
  return { background: "var(--surface2)", color: "var(--text2)" };
}

/**
 * Get meeting status badge
 */
export function getMeetingStatusBadge(status) {
  if (status === "completed") {
    return '<span style="padding:2px 8px;border-radius:12px;font-size:0.68rem;background:var(--accent2-light);color:var(--accent2);font-weight:600">Done</span>';
  }
  return '<span style="padding:2px 8px;border-radius:12px;font-size:0.68rem;background:var(--gold-light);color:var(--gold);font-weight:600">Upcoming</span>';
}

/**
 * Clear element children
 */
export function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Add event listener to multiple elements
 */
export function addEventListenerToAll(selector, event, handler) {
  document.querySelectorAll(selector).forEach((el) => {
    el.addEventListener(event, handler);
  });
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Get text color based on background
 */
export function getContrastColor(hexColor) {
  // Simple brightness calculation
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000" : "#fff";
}
