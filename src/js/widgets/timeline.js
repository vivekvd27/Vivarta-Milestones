/**
 * TIMELINE WIDGET
 * Vertical timeline of events with major/minor distinction
 */

import {
  appState,
  generateId,
  formatDate,
  daysUntil,
  saveState,
  dispatchStateChange,
} from "../state.js";
import { escapeHtml, clearChildren } from "../utils.js";

// Track expanded state for view all functionality
let timelineExpanded = false;

/**
 * Toggle timeline expanded state
 */
export function toggleTimelineExpanded() {
  timelineExpanded = !timelineExpanded;
  renderTimeline();
}

/**
 * Add a timeline event
 */
export function addTimelineEvent(title, description, date, type = "minor") {
  const event = {
    id: generateId(),
    title: escapeHtml(title),
    description: escapeHtml(description),
    date,
    type,
    createdAt: new Date().toISOString(),
  };

  appState.timeline.push(event);
  saveState();
  dispatchStateChange("timeline:add", event);
  return event;
}

/**
 * Delete timeline event
 */
export function deleteTimelineEvent(eventId) {
  appState.timeline = appState.timeline.filter((e) => e.id !== eventId);
  saveState();
  dispatchStateChange("timeline:delete", eventId);
}

/**
 * Get timeline events sorted by date
 */
export function getTimelineEvents() {
  return [...appState.timeline].sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Render timeline widget
 */
export function renderTimeline() {
  const container = document.getElementById("timelineWidget");
  if (!container) return;

  clearChildren(container);

  const events = getTimelineEvents();

  if (events.length === 0) {
    container.innerHTML = `
      <div style="padding:20px;text-align:center;color:var(--text3);font-size:0.85rem">
        <div style="font-size:1.5rem;margin-bottom:8px">📅</div>
        <p>No events yet. Add your first milestone.</p>
      </div>
    `;
    return;
  }

  // Show only 5 items in preview (unless expanded)
  const displayEvents = timelineExpanded ? events : events.slice(0, 5);
  const hasMore = events.length > 5;

  // Create timeline container
  const timeline = document.createElement("div");
  timeline.style.cssText =
    "position:relative;padding:20px 0;padding-left:36px";

  // Vertical line
  const line = document.createElement("div");
  line.style.cssText =
    "position:absolute;left:12px;top:0;bottom:0;width:2px;background:linear-gradient(180deg,var(--accent),transparent);border-radius:2px";
  timeline.appendChild(line);

  // Add events
  displayEvents.forEach((event, idx) => {
    const isMajor = event.type === "major";
    const daysText = daysUntil(event.date);

    const eventEl = document.createElement("div");
    eventEl.className = "timeline-event";
    eventEl.style.cssText = `
      margin-bottom: 20px;
      position: relative;
      opacity: 0;
      animation: fadeInUp 0.4s ease forwards;
      animation-delay: ${idx * 0.1}s;
    `;

    // Dot
    const dot = document.createElement("div");
    dot.style.cssText = `
      position: absolute;
      left: -26px;
      top: 4px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: ${isMajor ? "var(--accent)" : "var(--text3)"};
      border: 3px solid var(--surface);
      box-shadow: 0 0 0 3px ${isMajor ? "var(--accent-light)" : "transparent"};
      transition: all 0.2s;
    `;
    eventEl.appendChild(dot);

    // Content
    const content = document.createElement("div");
    content.style.cssText = `
      background: ${isMajor ? "var(--accent-light)" : "var(--surface2)"};
      border: 1px solid ${isMajor ? "var(--accent)" : "var(--border)"};
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      cursor: pointer;
      transition: all 0.2s;
    `;
    content.onmouseover = () => {
      content.style.transform = "translateX(4px)";
      content.style.boxShadow = "var(--shadow)";
    };
    content.onmouseout = () => {
      content.style.transform = "translateX(0)";
      content.style.boxShadow = "none";
    };

    // Title
    const title = document.createElement("div");
    title.style.cssText = `
      font-weight: 600;
      color: var(--text);
      font-size: 0.9rem;
      margin-bottom: 3px;
    `;
    title.textContent = event.title;
    content.appendChild(title);

    // Date & Type badge
    const meta = document.createElement("div");
    meta.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      font-size: 0.73rem;
    `;

    const dateSpan = document.createElement("span");
    dateSpan.style.cssText =
      "color: var(--text3);font-family:'DM Mono',monospace";
    dateSpan.textContent = formatDate(event.date);
    meta.appendChild(dateSpan);

    const typeBadge = document.createElement("span");
    typeBadge.style.cssText = `
      padding: 1px 6px;
      border-radius: 12px;
      font-family: 'DM Mono', monospace;
      font-weight: 600;
      background: ${isMajor ? "var(--accent)" : "var(--border)"};
      color: ${isMajor ? "#fff" : "var(--text3)"};
    `;
    typeBadge.textContent = isMajor ? "MAJOR" : "minor";
    meta.appendChild(typeBadge);

    content.appendChild(meta);

    // Description
    if (event.description) {
      const desc = document.createElement("div");
      desc.style.cssText =
        "font-size: 0.82rem;color: var(--text2);line-height: 1.5;margin-bottom:8px";
      desc.textContent = event.description;
      content.appendChild(desc);
    }

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.style.cssText = `
      background: none;
      border: none;
      color: var(--text3);
      font-size: 0.75rem;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;
      transition: all 0.2s;
    `;
    deleteBtn.innerHTML = "✕";
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
      deleteTimelineEvent(event.id);
      renderTimeline();
    };
    content.appendChild(deleteBtn);

    eventEl.appendChild(content);
    timeline.appendChild(eventEl);
  });

  container.appendChild(timeline);

  // Add "View All" button if there are more events
  if (hasMore) {
    const viewAllBtn = document.createElement("button");
    viewAllBtn.style.cssText = `
      display: block;
      margin-top: 16px;
      padding: 8px 14px;
      background: var(--accent-light);
      border: 1px solid var(--accent);
      border-radius: var(--radius-sm);
      color: var(--accent);
      font-family: 'Figtree', sans-serif;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    viewAllBtn.textContent = `📋 View All (${events.length} total)`;
    viewAllBtn.onmouseover = () => {
      viewAllBtn.style.background = "var(--accent)";
      viewAllBtn.style.color = "#fff";
    };
    viewAllBtn.onmouseout = () => {
      viewAllBtn.style.background = "var(--accent-light)";
      viewAllBtn.style.color = "var(--accent)";
    };
    viewAllBtn.onclick = () => {
      toggleTimelineExpanded();
    };
    container.appendChild(viewAllBtn);
  }

  // Add animation styles
  if (!document.querySelector("#timelineStyles")) {
    const style = document.createElement("style");
    style.id = "timelineStyles";
    style.textContent = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Initialize timeline widget form
 */
export function initTimelineForm() {
  const form = document.getElementById("timelineForm");
  if (!form) return;

  const titleInput = form.querySelector("#timelineTitle");
  const descInput = form.querySelector("#timelineDesc");
  const dateInput = form.querySelector("#timelineDate");
  const typeSelect = form.querySelector("#timelineType");
  const submitBtn = form.querySelector("button[type='submit']");

  if (!titleInput || !descInput || !dateInput || !typeSelect) return;

  submitBtn.onclick = (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const date = dateInput.value;
    const type = typeSelect.value;

    if (!title || !date) {
      alert("Please fill in title and date");
      return;
    }

    addTimelineEvent(title, description, date, type);
    renderTimeline();

    // Clear form
    titleInput.value = "";
    descInput.value = "";
    dateInput.value = "";
    typeSelect.value = "minor";
  };
}
