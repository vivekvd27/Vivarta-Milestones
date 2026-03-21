/**
 * MEETINGS TRACKER WIDGET
 * Track past and upcoming meetings with person/date/notes
 */

import {
  appState,
  generateId,
  formatDate,
  getTodayDate,
  saveState,
  dispatchStateChange,
} from "../state.js";
import { escapeHtml, clearChildren, formatDateShort } from "../utils.js";

// Track expanded state for view all functionality
let meetingsExpanded = false;

/**
 * Toggle meetings expanded state
 */
export function toggleMeetingsExpanded() {
  meetingsExpanded = !meetingsExpanded;
  renderMeetings();
}

/**
 * Add a meeting
 */
export function addMeeting(title, person, date, notes = "") {
  const today = getTodayDate();
  const status = date <= today ? "completed" : "upcoming";

  const meeting = {
    id: generateId(),
    title: escapeHtml(title),
    person: escapeHtml(person),
    date,
    notes: escapeHtml(notes),
    status,
    createdAt: new Date().toISOString(),
  };

  appState.meetings.push(meeting);
  saveState();
  dispatchStateChange("meetings:add", meeting);
  return meeting;
}

/**
 * Toggle meeting status
 */
export function toggleMeetingStatus(meetingId) {
  const meeting = appState.meetings.find((m) => m.id === meetingId);
  if (meeting) {
    meeting.status = meeting.status === "upcoming" ? "completed" : "upcoming";
    saveState();
    dispatchStateChange("meetings:toggle", meeting);
  }
}

/**
 * Delete meeting
 */
export function deleteMeeting(meetingId) {
  appState.meetings = appState.meetings.filter((m) => m.id !== meetingId);
  saveState();
  dispatchStateChange("meetings:delete", meetingId);
}

/**
 * Get meetings filtered by status
 */
export function getMeetingsByStatus(status) {
  return [...appState.meetings]
    .filter((m) => m.status === status)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Render meetings widget
 */
export function renderMeetings() {
  const container = document.getElementById("meetingsWidget");
  if (!container) return;

  clearChildren(container);

  const upcoming = getMeetingsByStatus("upcoming");
  const completed = getMeetingsByStatus("completed");

  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "display:flex;flex-direction:column;gap:20px;padding:2px";

  // UPCOMING MEETINGS
  const upcomingSection = document.createElement("div");
  upcomingSection.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
      <span style="font-family:'DM Mono',monospace;font-size:0.72rem;text-transform:uppercase;color:var(--text3);font-weight:700">Upcoming</span>
      <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:var(--gold-light);color:var(--gold);font-family:'DM Mono',monospace;font-size:0.7rem;font-weight:700">${upcoming.length}</span>
    </div>
  `;

  if (upcoming.length === 0) {
    upcomingSection.innerHTML +=
      '<div style="padding:12px;text-align:center;color:var(--text3);font-size:0.82rem;background:var(--surface2);border-radius:var(--radius-sm)">No upcoming meetings</div>';
  } else {
    // Show max 5 upcoming (unless expanded)
    const displayUpcoming = meetingsExpanded ? upcoming : upcoming.slice(0, 5);
    displayUpcoming.forEach((meeting) => {
      const meetingCard = createMeetingCard(meeting, "upcoming");
      upcomingSection.appendChild(meetingCard);
    });
    
    // Add View All button for upcoming if there are more
    if (upcoming.length > 5) {
      const viewAllBtn = document.createElement("button");
      viewAllBtn.style.cssText = `
        display: block;
        width: 100%;
        margin-top: 10px;
        padding: 7px 12px;
        background: var(--gold-light);
        border: 1px solid var(--gold);
        border-radius: var(--radius-sm);
        color: var(--gold);
        font-family: 'Figtree', sans-serif;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      `;
      viewAllBtn.textContent = `📋 View All (${upcoming.length} total)`;
      viewAllBtn.onmouseover = () => {
        viewAllBtn.style.background = "var(--gold)";
        viewAllBtn.style.color = "#fff";
      };
      viewAllBtn.onmouseout = () => {
        viewAllBtn.style.background = "var(--gold-light)";
        viewAllBtn.style.color = "var(--gold)";
      };
      viewAllBtn.onclick = () => {
        toggleMeetingsExpanded();
      };
      upcomingSection.appendChild(viewAllBtn);
    }
  }

  wrapper.appendChild(upcomingSection);

  // COMPLETED MEETINGS
  if (completed.length > 0) {
    const completedSection = document.createElement("div");
    completedSection.style.marginTop = "12px";
    completedSection.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="font-family:'DM Mono',monospace;font-size:0.72rem;text-transform:uppercase;color:var(--text3);font-weight:700">Completed</span>
        <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:var(--accent2-light);color:var(--accent2);font-family:'DM Mono',monospace;font-size:0.7rem;font-weight:700">${completed.length}</span>
      </div>
    `;

    // Show max 5 completed (unless expanded)
    const displayCompleted = meetingsExpanded ? completed : completed.slice(0, 5);
    displayCompleted.forEach((meeting) => {
      const meetingCard = createMeetingCard(meeting, "completed");
      completedSection.appendChild(meetingCard);
    });
    
    // Add View All button for completed if there are more
    if (completed.length > 5) {
      const viewAllBtn = document.createElement("button");
      viewAllBtn.style.cssText = `
        display: block;
        width: 100%;
        margin-top: 10px;
        padding: 7px 12px;
        background: var(--accent2-light);
        border: 1px solid var(--accent2);
        border-radius: var(--radius-sm);
        color: var(--accent2);
        font-family: 'Figtree', sans-serif;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      `;
      viewAllBtn.textContent = `📋 View All (${completed.length} total)`;
      viewAllBtn.onmouseover = () => {
        viewAllBtn.style.background = "var(--accent2)";
        viewAllBtn.style.color = "#fff";
      };
      viewAllBtn.onmouseout = () => {
        viewAllBtn.style.background = "var(--accent2-light)";
        viewAllBtn.style.color = "var(--accent2)";
      };
      viewAllBtn.onclick = () => {
        toggleMeetingsExpanded();
      };
      completedSection.appendChild(viewAllBtn);
    }

    wrapper.appendChild(completedSection);
  }

  container.appendChild(wrapper);
}

/**
 * Create individual meeting card
 */
function createMeetingCard(meeting, status) {
  const card = document.createElement("div");
  card.className = "meeting-card";
  card.style.cssText = `
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 11px 12px;
    background: ${status === "completed" ? "var(--accent2-light)" : "var(--gold-light)"};
    border: 1px solid ${status === "completed" ? "var(--accent2)" : "var(--gold)"};
    border-radius: var(--radius-sm);
    margin-bottom: 8px;
    transition: all 0.2s;
    cursor: pointer;
  `;

  card.onmouseover = () => {
    card.style.transform = "translateX(2px)";
    card.style.boxShadow = "var(--shadow)";
  };
  card.onmouseout = () => {
    card.style.transform = "translateX(0)";
    card.style.boxShadow = "none";
  };

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = status === "completed";
  checkbox.style.cssText =
    "width:16px;height:16px;cursor:pointer;flex-shrink:0;margin-top:2px;accent-color:var(--accent2)";
  checkbox.onclick = (e) => {
    e.stopPropagation();
    toggleMeetingStatus(meeting.id);
    renderMeetings();
  };
  card.appendChild(checkbox);

  // Content
  const content = document.createElement("div");
  content.style.cssText = "flex:1;min-width:0";

  const titleRow = document.createElement("div");
  titleRow.style.cssText =
    "display:flex;align-items:center;gap:8px;margin-bottom:3px";

  const title = document.createElement("div");
  title.style.cssText = `
    font-weight: 600;
    color: var(--text);
    font-size: 0.88rem;
    ${status === "completed" ? "text-decoration: line-through; color: var(--text3);" : ""}
  `;
  title.textContent = meeting.title;
  titleRow.appendChild(title);

  content.appendChild(titleRow);

  // Person & date
  const meta = document.createElement("div");
  meta.style.cssText =
    "display:flex;align-items:center;gap:8px;font-size:0.75rem;color:var(--text3);font-family:'DM Mono',monospace;margin-bottom:3px";
  meta.innerHTML = `
    <span>👤 ${escapeHtml(meeting.person)}</span>
    <span>•</span>
    <span>${formatDateShort(meeting.date)}</span>
  `;
  content.appendChild(meta);

  // Notes
  if (meeting.notes) {
    const notes = document.createElement("div");
    notes.style.cssText =
      "font-size:0.8rem;color:var(--text2);line-height:1.4";
    notes.textContent = meeting.notes;
    content.appendChild(notes);
  }

  card.appendChild(content);

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
    flex-shrink: 0;
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
    deleteMeeting(meeting.id);
    renderMeetings();
  };
  card.appendChild(deleteBtn);

  return card;
}

/**
 * Initialize meetings form
 */
export function initMeetingsForm() {
  const form = document.getElementById("meetingsForm");
  if (!form) return;

  const titleInput = form.querySelector("#meetingTitle");
  const personInput = form.querySelector("#meetingPerson");
  const dateInput = form.querySelector("#meetingDate");
  const notesInput = form.querySelector("#meetingNotes");
  const submitBtn = form.querySelector("button[type='submit']");

  if (!titleInput || !personInput || !dateInput) return;

  submitBtn.onclick = (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const person = personInput.value.trim();
    const date = dateInput.value;
    const notes = notesInput?.value.trim() || "";

    if (!title || !person || !date) {
      alert("Please fill in title, person, and date");
      return;
    }

    addMeeting(title, person, date, notes);
    renderMeetings();

    // Clear form
    titleInput.value = "";
    personInput.value = "";
    dateInput.value = "";
    if (notesInput) notesInput.value = "";
  };
}
