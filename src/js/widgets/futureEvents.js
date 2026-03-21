/**
 * FUTURE EVENTS / PREPARATION TRACKER
 * Track upcoming important events with urgency and preparation notes
 */

import {
  appState,
  generateId,
  formatDate,
  daysUntil,
  saveState,
  dispatchStateChange,
} from "../state.js";
import { escapeHtml, clearChildren, formatDateShort } from "../utils.js";

// Track expanded state for view all functionality
let futureEventsExpanded = false;

/**
 * Toggle future events expanded state
 */
export function toggleFutureEventsExpanded() {
  futureEventsExpanded = !futureEventsExpanded;
  renderFutureEvents();
}

/**
 * Add a future event
 */
export function addFutureEvent(title, date, notes = "", priority = "medium") {
  const event = {
    id: generateId(),
    title: escapeHtml(title),
    date,
    preparationNotes: escapeHtml(notes),
    priority,
    createdAt: new Date().toISOString(),
  };

  appState.futureEvents.push(event);
  saveState();
  dispatchStateChange("futureEvents:add", event);
  return event;
}

/**
 * Delete future event
 */
export function deleteFutureEvent(eventId) {
  appState.futureEvents = appState.futureEvents.filter((e) => e.id !== eventId);
  saveState();
  dispatchStateChange("futureEvents:delete", eventId);
}

/**
 * Get future events sorted by urgency (closest first)
 */
export function getFutureEvents() {
  return [...appState.futureEvents].sort(
    (a, b) => daysUntil(a.date) - daysUntil(b.date)
  );
}

/**
 * Get events by priority level
 */
export function getEventsByPriority(priority) {
  return getFutureEvents().filter((e) => e.priority === priority);
}

/**
 * Render future events widget
 */
export function renderFutureEvents() {
  const container = document.getElementById("futureEventsWidget");
  if (!container) return;

  clearChildren(container);

  const events = getFutureEvents();

  if (events.length === 0) {
    container.innerHTML = `
      <div style="padding:20px;text-align:center;color:var(--text3);font-size:0.85rem">
        <div style="font-size:1.5rem;margin-bottom:8px">🎯</div>
        <p>No upcoming events. Add one to start preparing.</p>
      </div>
    `;
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "display:flex;flex-direction:column;gap:12px;padding:2px";

  // Show max 5 events in preview (unless expanded)
  const displayEvents = futureEventsExpanded ? events : events.slice(0, 5);
  const hasMore = events.length > 5;

  // Group by priority (from displayed events)
  const highPriority = displayEvents.filter((e) => e.priority === "high");
  const mediumPriority = displayEvents.filter((e) => e.priority === "medium");
  const lowPriority = displayEvents.filter((e) => e.priority === "low");

  // HIGH PRIORITY
  if (highPriority.length > 0) {
    const section = createPrioritySection("🔴 CRITICAL", highPriority, "high");
    wrapper.appendChild(section);
  }

  // MEDIUM PRIORITY
  if (mediumPriority.length > 0) {
    const section = createPrioritySection(
      "🟠 IMPORTANT",
      mediumPriority,
      "medium"
    );
    wrapper.appendChild(section);
  }

  // LOW PRIORITY
  if (lowPriority.length > 0) {
    const section = createPrioritySection(
      "🟢 LOW PRIORITY",
      lowPriority,
      "low"
    );
    wrapper.appendChild(section);
  }

  // Add View All button if there are more events
  if (hasMore) {
    const viewAllBtn = document.createElement("button");
    viewAllBtn.style.cssText = `
      display: block;
      width: 100%;
      margin-top: 12px;
      padding: 8px 12px;
      background: var(--entre-light);
      border: 1px solid var(--entre);
      border-radius: var(--radius-sm);
      color: var(--entre);
      font-family: 'Figtree', sans-serif;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    viewAllBtn.textContent = `📋 View All (${events.length} total)`;
    viewAllBtn.onmouseover = () => {
      viewAllBtn.style.background = "var(--entre)";
      viewAllBtn.style.color = "#fff";
    };
    viewAllBtn.onmouseout = () => {
      viewAllBtn.style.background = "var(--entre-light)";
      viewAllBtn.style.color = "var(--entre)";
    };
    viewAllBtn.onclick = () => {
      toggleFutureEventsExpanded();
    };
    wrapper.appendChild(viewAllBtn);
  }

  container.appendChild(wrapper);
}

/**
 * Create priority section
 */
function createPrioritySection(label, events, priority) {
  const section = document.createElement("div");

  const header = document.createElement("div");
  header.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 0.75rem;
    font-family: 'DM Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${getPriorityColor(priority)};
    font-weight: 700;
  `;
  header.innerHTML = `
    <span>${label}</span>
    <span style="width:16px;height:16px;border-radius:50%;background:${getPriorityBg(priority)};display:flex;align-items:center;justify-content:center;font-size:0.65rem;color:#fff">${events.length}</span>
  `;
  section.appendChild(header);

  events.forEach((event, idx) => {
    const card = createEventCard(event, priority, idx);
    section.appendChild(card);
  });

  return section;
}

/**
 * Create event card
 */
function createEventCard(event, priority, idx) {
  const card = document.createElement("div");
  const days = daysUntil(event.date);

  card.style.cssText = `
    padding: 12px 14px;
    background: ${getPriorityBg(priority)};
    border: 1px solid ${getPriorityBorder(priority)};
    border-radius: var(--radius-sm);
    margin-bottom: 8px;
    opacity: 0;
    animation: slideIn 0.3s ease forwards;
    animation-delay: ${idx * 0.08}s;
    transition: all 0.2s;
  `;

  card.onmouseover = () => {
    card.style.transform = "translateX(3px)";
    card.style.boxShadow = "var(--shadow)";
  };
  card.onmouseout = () => {
    card.style.transform = "translateX(0)";
    card.style.boxShadow = "none";
  };

  // Title
  const title = document.createElement("div");
  title.style.cssText = `
    font-weight: 600;
    color: var(--text);
    font-size: 0.88rem;
    margin-bottom: 6px;
  `;
  title.textContent = event.title;
  card.appendChild(title);

  // Urgency badge & date
  const meta = document.createElement("div");
  meta.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 0.72rem;
  `;

  let urgencyLabel = "";
  let urgencyColor = "var(--text3)";

  if (days < 0) {
    urgencyLabel = `OVERDUE (${Math.abs(days)}d ago)`;
    urgencyColor = "var(--red)";
  } else if (days === 0) {
    urgencyLabel = "TODAY";
    urgencyColor = "var(--red)";
  } else if (days <= 3) {
    urgencyLabel = `IN ${days} DAYS`;
    urgencyColor = "var(--gold)";
  } else if (days <= 7) {
    urgencyLabel = `IN ${days} DAYS`;
    urgencyColor = "var(--accent2)";
  } else {
    urgencyLabel = formatDateShort(event.date);
    urgencyColor = "var(--text3)";
  }

  const urgency = document.createElement("span");
  urgency.style.cssText = `
    padding: 1px 6px;
    border-radius: 10px;
    background: ${urgencyColor === "var(--red)" ? "var(--red-light)" : urgencyColor === "var(--gold)" ? "var(--gold-light)" : "var(--surface2)"};
    color: ${urgencyColor};
    font-family: 'DM Mono', monospace;
    font-weight: 600;
    white-space: nowrap;
  `;
  urgency.textContent = urgencyLabel;
  meta.appendChild(urgency);

  meta.appendChild(document.createTextNode(`${formatDate(event.date)}`));
  card.appendChild(meta);

  // Preparation notes
  if (event.preparationNotes) {
    const notes = document.createElement("div");
    notes.style.cssText = `
      font-size: 0.8rem;
      color: var(--text2);
      line-height: 1.4;
      padding: 8px;
      background: rgba(0,0,0,0.02);
      border-radius: 6px;
      margin: 8px 0;
    `;
    notes.innerHTML = `<strong style="font-size:0.72rem;color:var(--text3)">Prep:</strong> <div style="margin-top:3px">${event.preparationNotes}</div>`;
    card.appendChild(notes);
  }

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.style.cssText = `
    background: none;
    border: none;
    color: var(--text3);
    font-size: 0.7rem;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 4px;
    transition: all 0.2s;
    margin-top: 6px;
  `;
  deleteBtn.innerHTML = "✕ Remove";
  deleteBtn.onmouseover = () => {
    deleteBtn.style.background = "var(--red-light)";
    deleteBtn.style.color = "var(--red)";
  };
  deleteBtn.onmouseout = () => {
    deleteBtn.style.background = "none";
    deleteBtn.style.color = "var(--text3)";
  };
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    deleteFutureEvent(event.id);
    renderFutureEvents();
  };
  card.appendChild(deleteBtn);

  return card;
}

/**
 * Get priority background color
 */
function getPriorityBg(priority) {
  const colors = {
    high: "var(--red-light)",
    medium: "var(--gold-light)",
    low: "var(--accent2-light)",
  };
  return colors[priority] || "var(--surface2)";
}

/**
 * Get priority border color
 */
function getPriorityBorder(priority) {
  const colors = {
    high: "var(--red)",
    medium: "var(--gold)",
    low: "var(--accent2)",
  };
  return colors[priority] || "var(--border)";
}

/**
 * Get priority text color
 */
function getPriorityColor(priority) {
  const colors = {
    high: "var(--red)",
    medium: "var(--gold)",
    low: "var(--accent2)",
  };
  return colors[priority] || "var(--text3)";
}

/**
 * Initialize future events form
 */
export function initFutureEventsForm() {
  const form = document.getElementById("futureEventsForm");
  if (!form) return;

  const titleInput = form.querySelector("#eventTitle");
  const dateInput = form.querySelector("#eventDate");
  const notesInput = form.querySelector("#eventNotes");
  const prioritySelect = form.querySelector("#eventPriority");
  const submitBtn = form.querySelector("button[type='submit']");

  if (!titleInput || !dateInput || !prioritySelect) return;

  submitBtn.onclick = (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const date = dateInput.value;
    const notes = notesInput?.value.trim() || "";
    const priority = prioritySelect.value;

    if (!title || !date) {
      alert("Please fill in title and date");
      return;
    }

    addFutureEvent(title, date, notes, priority);
    renderFutureEvents();

    // Clear form
    titleInput.value = "";
    dateInput.value = "";
    if (notesInput) notesInput.value = "";
    prioritySelect.value = "medium";
  };

  // Add animation style
  if (!document.querySelector("#futureEventsStyles")) {
    const style = document.createElement("style");
    style.id = "futureEventsStyles";
    style.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(-8px); }
        to { opacity: 1; transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
  }
}
