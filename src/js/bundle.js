/**
 * VIVARTA DASHBOARD - BUNDLED APPLICATION
 * All modules compiled into a single file
 * Compatible with static file loading (no ES Module syntax)
 */

// ============================================
// STATE MANAGEMENT (from state.js)
// ============================================

const appState = {
  timeline: [],
  meetings: [],
  contacts: [],
  futureEvents: [],
  ruleOfThree: [],
  affirmations: [],
  habitCompletions: {}, // Multi-person habit data: { "YYYY-MM-DD": { "Vivek": { habitId: true } } }
  teamTasks: {}, // Team Tasks by person: { "Vivek": [{ id, text, done }], ... }
};

function saveState() {
  try {
    console.log("📝 saveState() called - saving appState to localStorage");
    console.log("   appState.ruleOfThree.length:", appState.ruleOfThree?.length || 0);
    console.log("   appState.teamTasks:", appState.teamTasks || {});
    console.log("   teamTasks detail:", Object.entries(appState.teamTasks || {}).map(([p, t]) => `${p}: ${t?.length || 0} tasks`).join(", "));
    localStorage.setItem("vivartaState", JSON.stringify(appState));
    console.log("✓ setItem called successfully");
  } catch (error) {
    console.error("Error saving state:", error);
  }
}

function loadState() {
  try {
    const data = JSON.parse(localStorage.getItem("vivartaState") || "{}");
    if (data.timeline) appState.timeline = data.timeline;
    if (data.meetings) appState.meetings = data.meetings;
    if (data.contacts) appState.contacts = data.contacts;
    if (data.futureEvents) appState.futureEvents = data.futureEvents;
    if (data.ruleOfThree) appState.ruleOfThree = data.ruleOfThree;
    if (data.affirmations) appState.affirmations = data.affirmations;
  } catch (error) {
    console.error("Error loading state:", error);
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysUntil(dateStr) {
  const today = new Date();
  const target = new Date(dateStr + "T00:00:00");
  const diff = target - today;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
}

function showToast(message, type = "success") {
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

function createToastContainer() {
  const container = document.createElement("div");
  container.className = "toast-container";
  document.body.appendChild(container);
  return container;
}

function dispatchStateChange(type, data) {
  window.dispatchEvent(
    new CustomEvent("stateChange", {
      detail: { type, data, timestamp: Date.now() },
    })
  );
}

// ============================================
// UTILITY FUNCTIONS (from utils.js)
// ============================================

function createElement(tag, className, innerHTML = "") {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}

function formatDateShort(dateStr) {
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

function getPriorityColor(priority) {
  const colors = {
    high: "var(--red)",
    medium: "var(--gold)",
    low: "var(--accent2)",
  };
  return colors[priority] || "var(--text3)";
}

function getEventTypeStyle(type) {
  if (type === "major") {
    return { background: "var(--accent-light)", color: "var(--accent)" };
  }
  return { background: "var(--surface2)", color: "var(--text2)" };
}

function getMeetingStatusBadge(status) {
  if (status === "completed") {
    return '<span style="padding:2px 8px;border-radius:12px;font-size:0.68rem;background:var(--accent2-light);color:var(--accent2);font-weight:600">Done</span>';
  }
  return '<span style="padding:2px 8px;border-radius:12px;font-size:0.68rem;background:var(--gold-light);color:var(--gold);font-weight:600">Upcoming</span>';
}

function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function addEventListenerToAll(selector, event, handler) {
  document.querySelectorAll(selector).forEach((el) => {
    el.addEventListener(event, handler);
  });
}

function debounce(func, wait) {
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

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getContrastColor(hexColor) {
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000" : "#fff";
}

// ============================================
// TIMELINE WIDGET (from timeline.js)
// ============================================

let timelineExpanded = false;

function toggleTimelineExpanded() {
  timelineExpanded = !timelineExpanded;
  renderTimeline();
}

function addTimelineEvent(title, description, date, type = "minor") {
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

function deleteTimelineEvent(eventId) {
  appState.timeline = appState.timeline.filter((e) => e.id !== eventId);
  saveState();
  dispatchStateChange("timeline:delete", eventId);
}

function getTimelineEvents() {
  return [...appState.timeline].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderTimeline() {
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

  const displayEvents = timelineExpanded ? events : events.slice(0, 5);
  const hasMore = events.length > 5;

  const timeline = document.createElement("div");
  timeline.style.cssText = "position:relative;padding:20px 0;padding-left:36px";

  const line = document.createElement("div");
  line.style.cssText = "position:absolute;left:12px;top:0;bottom:0;width:2px;background:linear-gradient(180deg,var(--accent),transparent);border-radius:2px";
  timeline.appendChild(line);

  displayEvents.forEach((event, idx) => {
    const isMajor = event.type === "major";

    const eventEl = document.createElement("div");
    eventEl.className = "timeline-event";
    eventEl.style.cssText = `
      margin-bottom: 20px;
      position: relative;
      opacity: 0;
      animation: fadeInUp 0.4s ease forwards;
      animation-delay: ${idx * 0.1}s;
    `;

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

    const title = document.createElement("div");
    title.style.cssText = `
      font-weight: 600;
      color: var(--text);
      font-size: 0.9rem;
      margin-bottom: 3px;
    `;
    title.textContent = event.title;
    content.appendChild(title);

    const meta = document.createElement("div");
    meta.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      font-size: 0.73rem;
    `;

    const dateSpan = document.createElement("span");
    dateSpan.style.cssText = "color: var(--text3);font-family:'DM Mono',monospace";
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

    if (event.description) {
      const desc = document.createElement("div");
      desc.style.cssText = "font-size: 0.82rem;color: var(--text2);line-height: 1.5;margin-bottom:8px";
      desc.textContent = event.description;
      content.appendChild(desc);
    }

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
      openTimelineFullPage();
    };
    container.appendChild(viewAllBtn);
  }

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

function initTimelineForm() {
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

    titleInput.value = "";
    descInput.value = "";
    dateInput.value = "";
    typeSelect.value = "minor";
  };
}

// ============================================
// MEETINGS WIDGET (from meetings.js)
// ============================================

let meetingsExpanded = false;

function toggleMeetingsExpanded() {
  meetingsExpanded = !meetingsExpanded;
  renderMeetings();
}

function addMeeting(title, person, date, notes = "") {
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

function toggleMeetingStatus(meetingId) {
  const meeting = appState.meetings.find((m) => m.id === meetingId);
  if (meeting) {
    meeting.status = meeting.status === "upcoming" ? "completed" : "upcoming";
    saveState();
    dispatchStateChange("meetings:toggle", meeting);
  }
}

function deleteMeeting(meetingId) {
  appState.meetings = appState.meetings.filter((m) => m.id !== meetingId);
  saveState();
  dispatchStateChange("meetings:delete", meetingId);
}

function getMeetingsByStatus(status) {
  return [...appState.meetings]
    .filter((m) => m.status === status)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderMeetings() {
  const container = document.getElementById("meetingsWidget");
  if (!container) return;

  clearChildren(container);

  const upcoming = getMeetingsByStatus("upcoming");
  const completed = getMeetingsByStatus("completed");

  const wrapper = document.createElement("div");
  wrapper.style.cssText = "display:flex;flex-direction:column;gap:20px;padding:2px";

  const upcomingSection = document.createElement("div");
  upcomingSection.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
      <span style="font-family:'DM Mono',monospace;font-size:0.72rem;text-transform:uppercase;color:var(--text3);font-weight:700">Upcoming</span>
      <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:var(--gold-light);color:var(--gold);font-family:'DM Mono',monospace;font-size:0.7rem;font-weight:700">${upcoming.length}</span>
    </div>
  `;

  if (upcoming.length === 0) {
    upcomingSection.innerHTML += '<div style="padding:12px;text-align:center;color:var(--text3);font-size:0.82rem;background:var(--surface2);border-radius:var(--radius-sm)">No upcoming meetings</div>';
  } else {
    const displayUpcoming = meetingsExpanded ? upcoming : upcoming.slice(0, 5);
    displayUpcoming.forEach((meeting) => {
      const meetingCard = createMeetingCard(meeting, "upcoming");
      upcomingSection.appendChild(meetingCard);
    });
    
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
        openMeetingsFullPage();
      };
      upcomingSection.appendChild(viewAllBtn);
    }
  }

  wrapper.appendChild(upcomingSection);

  if (completed.length > 0) {
    const completedSection = document.createElement("div");
    completedSection.style.marginTop = "12px";
    completedSection.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="font-family:'DM Mono',monospace;font-size:0.72rem;text-transform:uppercase;color:var(--text3);font-weight:700">Completed</span>
        <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:var(--accent2-light);color:var(--accent2);font-family:'DM Mono',monospace;font-size:0.7rem;font-weight:700">${completed.length}</span>
      </div>
    `;

    const displayCompleted = meetingsExpanded ? completed : completed.slice(0, 5);
    displayCompleted.forEach((meeting) => {
      const meetingCard = createMeetingCard(meeting, "completed");
      completedSection.appendChild(meetingCard);
    });
    
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
        openMeetingsFullPage();
      };
      completedSection.appendChild(viewAllBtn);
    }

    wrapper.appendChild(completedSection);
  }

  container.appendChild(wrapper);
}

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

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = status === "completed";
  checkbox.style.cssText = "width:16px;height:16px;cursor:pointer;flex-shrink:0;margin-top:2px;accent-color:var(--accent2)";
  checkbox.onclick = (e) => {
    e.stopPropagation();
    toggleMeetingStatus(meeting.id);
    renderMeetings();
  };
  card.appendChild(checkbox);

  const content = document.createElement("div");
  content.style.cssText = "flex:1;min-width:0";

  const titleRow = document.createElement("div");
  titleRow.style.cssText = "display:flex;align-items:center;gap:8px;margin-bottom:3px";

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

  const meta = document.createElement("div");
  meta.style.cssText = "display:flex;align-items:center;gap:8px;font-size:0.75rem;color:var(--text3);font-family:'DM Mono',monospace;margin-bottom:3px";
  meta.innerHTML = `
    <span>👤 ${escapeHtml(meeting.person)}</span>
    <span>•</span>
    <span>${formatDateShort(meeting.date)}</span>
  `;
  content.appendChild(meta);

  if (meeting.notes) {
    const notes = document.createElement("div");
    notes.style.cssText = "font-size:0.8rem;color:var(--text2);line-height:1.4";
    notes.textContent = meeting.notes;
    content.appendChild(notes);
  }

  card.appendChild(content);

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

function initMeetingsForm() {
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
    const notes = notesInput ? notesInput.value.trim() : "";

    if (!title || !person || !date) {
      alert("Please fill in title, person, and date");
      return;
    }

    addMeeting(title, person, date, notes);
    renderMeetings();

    titleInput.value = "";
    personInput.value = "";
    dateInput.value = "";
    if (notesInput) notesInput.value = "";
  };
}

// ============================================
// NETWORKING WIDGET (from networking.js)
// ============================================

let networkingExpanded = false;

function toggleNetworkingExpanded() {
  networkingExpanded = !networkingExpanded;
  renderContacts();
}

function addContact(name, role, company, notes = "") {
  const contact = {
    id: generateId(),
    name: escapeHtml(name),
    role: escapeHtml(role),
    company: escapeHtml(company),
    notes: escapeHtml(notes),
    lastContact: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
  };

  appState.contacts.push(contact);
  saveState();
  dispatchStateChange("contacts:add", contact);
  return contact;
}

function updateContactLastInteraction(contactId) {
  const contact = appState.contacts.find((c) => c.id === contactId);
  if (contact) {
    contact.lastContact = new Date().toISOString().split("T")[0];
    saveState();
    dispatchStateChange("contacts:update", contact);
  }
}

function deleteContact(contactId) {
  appState.contacts = appState.contacts.filter((c) => c.id !== contactId);
  saveState();
  dispatchStateChange("contacts:delete", contactId);
}

function searchContacts(query) {
  const q = query.toLowerCase();
  return appState.contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q)
  );
}

function getAllContacts() {
  return [...appState.contacts].sort(
    (a, b) => new Date(b.lastContact) - new Date(a.lastContact)
  );
}

function renderContacts() {
  const container = document.getElementById("networkingWidget");
  if (!container) return;

  clearChildren(container);

  const contacts = getAllContacts();

  if (contacts.length === 0) {
    container.innerHTML = `
      <div style="padding:20px;text-align:center;color:var(--text3);font-size:0.85rem">
        <div style="font-size:1.5rem;margin-bottom:8px">🤝</div>
        <p>No contacts yet. Start building your network.</p>
      </div>
    `;
    return;
  }

  const searchBar = document.createElement("div");
  searchBar.style.cssText = "margin-bottom:14px";
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search contacts…";
  searchInput.style.cssText = `
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface2);
    color: var(--text);
    font-family: 'Figtree', sans-serif;
    font-size: 0.85rem;
    outline: none;
    transition: border-color 0.15s;
  `;

  searchInput.onfocus = () => {
    searchInput.style.borderColor = "var(--accent)";
  };
  searchInput.onblur = () => {
    searchInput.style.borderColor = "var(--border)";
  };

  searchBar.appendChild(searchInput);
  container.appendChild(searchBar);

  const contactsList = document.createElement("div");
  contactsList.style.cssText = "display:flex;flex-direction:column;gap:10px";
  container.appendChild(contactsList);

  searchInput.oninput = (e) => {
    const query = e.target.value;
    const results = query ? searchContacts(query) : contacts;
    renderContactsList(contactsList, results);
  };

  renderContactsList(contactsList, contacts);
}

function renderContactsList(container, contacts) {
  clearChildren(container);

  if (contacts.length === 0) {
    container.innerHTML = '<div style="padding:12px;text-align:center;color:var(--text3);font-size:0.82rem">No contacts found</div>';
    return;
  }

  const displayContacts = networkingExpanded ? contacts : contacts.slice(0, 5);
  const hasMore = contacts.length > 5;

  displayContacts.forEach((contact, idx) => {
    const card = document.createElement("div");
    card.className = "contact-card";
    card.style.cssText = `
      padding: 12px 14px;
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      transition: all 0.2s;
      opacity: 0;
      animation: fadeIn 0.3s ease forwards;
      animation-delay: ${idx * 0.05}s;
    `;

    card.onmouseover = () => {
      card.style.transform = "translateY(-2px)";
      card.style.boxShadow = "var(--shadow)";
    };
    card.onmouseout = () => {
      card.style.transform = "translateY(0)";
      card.style.boxShadow = "none";
    };

    const header = document.createElement("div");
    header.style.cssText = "display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px";

    const nameSection = document.createElement("div");
    nameSection.style.cssText = "flex:1;min-width:0";

    const name = document.createElement("div");
    name.style.cssText = "font-weight:600;color:var(--text);font-size:0.88rem;margin-bottom:2px";
    name.textContent = contact.name;
    nameSection.appendChild(name);

    const company = document.createElement("div");
    company.style.cssText = "font-size:0.78rem;color:var(--text3);font-family:'DM Mono',monospace";
    company.textContent = contact.company;
    nameSection.appendChild(company);

    header.appendChild(nameSection);

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
      deleteContact(contact.id);
      renderContacts();
    };
    header.appendChild(deleteBtn);

    card.appendChild(header);

    const meta = document.createElement("div");
    meta.style.cssText = "display:flex;align-items:center;gap:10px;font-size:0.73rem;color:var(--text2);margin-bottom:8px;flex-wrap:wrap";
    meta.innerHTML = `
      <span style="padding:1px 6px;border-radius:10px;background:var(--accent-light);color:var(--accent)">
        ${escapeHtml(contact.role)}
      </span>
      <span style="color:var(--text3)">Last: ${formatDateShort(contact.lastContact)}</span>
    `;
    card.appendChild(meta);

    if (contact.notes) {
      const notes = document.createElement("div");
      notes.style.cssText = "font-size:0.8rem;color:var(--text2);line-height:1.4;border-top:1px solid var(--border);padding-top:8px;margin-top:8px";
      notes.innerHTML = `<span style="color:var(--text3);font-family:'DM Mono',monospace;font-size:0.7rem">Notes:</span><div style="margin-top:2px">${contact.notes}</div>`;
      card.appendChild(notes);
    }

    container.appendChild(card);
  });

  if (hasMore) {
    const viewAllBtn = document.createElement("button");
    viewAllBtn.style.cssText = `
      display: block;
      width: 100%;
      margin-top: 12px;
      padding: 8px 12px;
      background: var(--accent2-light);
      border: 1px solid var(--accent2);
      border-radius: var(--radius-sm);
      color: var(--accent2);
      font-family: 'Figtree', sans-serif;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    viewAllBtn.textContent = `📋 View All (${contacts.length} total)`;
    viewAllBtn.onmouseover = () => {
      viewAllBtn.style.background = "var(--accent2)";
      viewAllBtn.style.color = "#fff";
    };
    viewAllBtn.onmouseout = () => {
      viewAllBtn.style.background = "var(--accent2-light)";
      viewAllBtn.style.color = "var(--accent2)";
    };
    viewAllBtn.onclick = () => {
      openNetworkingFullPage();
    };
    container.appendChild(viewAllBtn);
  }

  if (!document.querySelector("#networkingStyles")) {
    const style = document.createElement("style");
    style.id = "networkingStyles";
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
}

function initNetworkingForm() {
  const form = document.getElementById("networkingForm");
  if (!form) return;

  const nameInput = form.querySelector("#contactName");
  const roleInput = form.querySelector("#contactRole");
  const companyInput = form.querySelector("#contactCompany");
  const notesInput = form.querySelector("#contactNotes");
  const submitBtn = form.querySelector("button[type='submit']");

  if (!nameInput || !roleInput || !companyInput) return;

  submitBtn.onclick = (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const role = roleInput.value.trim();
    const company = companyInput.value.trim();
    const notes = notesInput ? notesInput.value.trim() : "";

    if (!name || !role || !company) {
      alert("Please fill in name, role, and company");
      return;
    }

    addContact(name, role, company, notes);
    renderContacts();

    nameInput.value = "";
    roleInput.value = "";
    companyInput.value = "";
    if (notesInput) notesInput.value = "";
  };
}

// ============================================
// FUTURE EVENTS WIDGET (from futureEvents.js)
// ============================================

let futureEventsExpanded = false;

function toggleFutureEventsExpanded() {
  futureEventsExpanded = !futureEventsExpanded;
  renderFutureEvents();
}

function addFutureEvent(title, date, notes = "", priority = "medium") {
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

function deleteFutureEvent(eventId) {
  appState.futureEvents = appState.futureEvents.filter((e) => e.id !== eventId);
  saveState();
  dispatchStateChange("futureEvents:delete", eventId);
}

function getFutureEvents() {
  return [...appState.futureEvents].sort(
    (a, b) => daysUntil(a.date) - daysUntil(b.date)
  );
}

function getEventsByPriority(priority) {
  return getFutureEvents().filter((e) => e.priority === priority);
}

function renderFutureEvents() {
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
  wrapper.style.cssText = "display:flex;flex-direction:column;gap:12px;padding:2px";

  const displayEvents = futureEventsExpanded ? events : events.slice(0, 5);
  const hasMore = events.length > 5;

  const highPriority = displayEvents.filter((e) => e.priority === "high");
  const mediumPriority = displayEvents.filter((e) => e.priority === "medium");
  const lowPriority = displayEvents.filter((e) => e.priority === "low");

  if (highPriority.length > 0) {
    const section = createPrioritySection("🔴 CRITICAL", highPriority, "high");
    wrapper.appendChild(section);
  }

  if (mediumPriority.length > 0) {
    const section = createPrioritySection("🟠 IMPORTANT", mediumPriority, "medium");
    wrapper.appendChild(section);
  }

  if (lowPriority.length > 0) {
    const section = createPrioritySection("🟢 LOW PRIORITY", lowPriority, "low");
    wrapper.appendChild(section);
  }

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
      openFutureEventsFullPage();
    };
    wrapper.appendChild(viewAllBtn);
  }

  container.appendChild(wrapper);
}

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
  const priorityBg = priority === "high" ? "var(--red)" : priority === "medium" ? "var(--gold)" : "var(--accent2)";
  header.innerHTML = `
    <span>${label}</span>
    <span style="width:16px;height:16px;border-radius:50%;background:${priorityBg};display:flex;align-items:center;justify-content:center;font-size:0.65rem;color:#fff">${events.length}</span>
  `;
  section.appendChild(header);

  events.forEach((event, idx) => {
    const card = createEventCard(event, priority, idx);
    section.appendChild(card);
  });

  return section;
}

function createEventCard(event, priority, idx) {
  const card = document.createElement("div");
  const days = daysUntil(event.date);
  const priorityBg = priority === "high" ? "var(--red-light)" : priority === "medium" ? "var(--gold-light)" : "var(--accent2-light)";
  const priorityBorder = priority === "high" ? "var(--red)" : priority === "medium" ? "var(--gold)" : "var(--accent2)";

  card.style.cssText = `
    padding: 12px 14px;
    background: ${priorityBg};
    border: 1px solid ${priorityBorder};
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

  const title = document.createElement("div");
  title.style.cssText = `
    font-weight: 600;
    color: var(--text);
    font-size: 0.88rem;
    margin-bottom: 6px;
  `;
  title.textContent = event.title;
  card.appendChild(title);

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
  const urgencyBg = urgencyColor === "var(--red)" ? "var(--red-light)" : urgencyColor === "var(--gold)" ? "var(--gold-light)" : "var(--surface2)";
  urgency.style.cssText = `
    padding: 1px 6px;
    border-radius: 10px;
    background: ${urgencyBg};
    color: ${urgencyColor};
    font-family: 'DM Mono', monospace;
    font-weight: 600;
    white-space: nowrap;
  `;
  urgency.textContent = urgencyLabel;
  meta.appendChild(urgency);

  meta.appendChild(document.createTextNode(`${formatDate(event.date)}`));
  card.appendChild(meta);

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

function initFutureEventsForm() {
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
    const notes = notesInput ? notesInput.value.trim() : "";
    const priority = prioritySelect.value;

    if (!title || !date) {
      alert("Please fill in title and date");
      return;
    }

    addFutureEvent(title, date, notes, priority);
    renderFutureEvents();

    titleInput.value = "";
    dateInput.value = "";
    if (notesInput) notesInput.value = "";
    prioritySelect.value = "medium";
  };
}

// ============================================
// RULE OF 3 WIDGET
// ============================================

function addRuleOfThreeTask(person, task) {
  console.log("➕ addRuleOfThreeTask called:", { person, task });
  
  const ruleTask = {
    id: generateId(),
    person: escapeHtml(person),
    task: escapeHtml(task),
    completed: false,
    createdAt: new Date().toISOString(),
  };

  console.log("   🎯 New Team Task:", ruleTask);
  console.log("   📊 Before adding - appState.ruleOfThree length:", appState.ruleOfThree?.length || 0);
  appState.ruleOfThree.push(ruleTask);
  console.log("   ✅ Task added - appState.ruleOfThree length:", appState.ruleOfThree.length);
  
  console.log("   📤 Calling saveState() to sync to Supabase...");
  saveState();
  
  dispatchStateChange("ruleOfThree:add", ruleTask);
  console.log("✓ addRuleOfThreeTask complete - Team Task queued for Supabase");
  return ruleTask;
}

function toggleRuleOfThreeTask(taskId) {
  const task = appState.ruleOfThree.find((t) => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveState();
    dispatchStateChange("ruleOfThree:toggle", task);
  }
}

function deleteRuleOfThreeTask(taskId) {
  appState.ruleOfThree = appState.ruleOfThree.filter((t) => t.id !== taskId);
  saveState();
  dispatchStateChange("ruleOfThree:delete", taskId);
}

function getRuleOfThreeByPerson(person) {
  return appState.ruleOfThree.filter((t) => t.person === person);
}

// ============================================
// AFFIRMATIONS FUNCTIONS
// ============================================

function addAffirmation(text, category) {
  const affirmation = {
    id: generateId(),
    text: escapeHtml(text),
    category: category,
    createdAt: new Date().toISOString(),
  };
  appState.affirmations.push(affirmation);
  saveState();
  dispatchStateChange("affirmations:add", affirmation);
  return affirmation;
}

function deleteAffirmation(affirmationId) {
  appState.affirmations = appState.affirmations.filter((a) => a.id !== affirmationId);
  saveState();
  dispatchStateChange("affirmations:delete", affirmationId);
}

function moveAffirmationUp(affirmationId) {
  const index = appState.affirmations.findIndex((a) => a.id === affirmationId);
  if (index > 0) {
    [appState.affirmations[index - 1], appState.affirmations[index]] = [
      appState.affirmations[index],
      appState.affirmations[index - 1],
    ];
    saveState();
    dispatchStateChange("affirmations:move", affirmationId);
  }
}

function moveAffirmationDown(affirmationId) {
  const index = appState.affirmations.findIndex((a) => a.id === affirmationId);
  if (index < appState.affirmations.length - 1) {
    [appState.affirmations[index + 1], appState.affirmations[index]] = [
      appState.affirmations[index],
      appState.affirmations[index + 1],
    ];
    saveState();
    dispatchStateChange("affirmations:move", affirmationId);
  }
}

function getAffirmations() {
  return appState.affirmations;
}

function renderAffirmationsFullPage() {
  const container = document.getElementById("affirmationsFullPageContent");
  if (!container) return;

  clearChildren(container);
  const affirmations = getAffirmations();

  // Add new affirmation form
  const formContainer = document.createElement("div");
  formContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: var(--surface2);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    margin-bottom: 24px;
  `;

  const inputWrapper = document.createElement("div");
  inputWrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
  `;

  const inputLabel = document.createElement("label");
  inputLabel.textContent = "New Affirmation:";
  inputLabel.style.cssText = `
    font-size: 0.85rem;
    color: var(--text2);
    font-family: 'DM Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  `;
  inputWrapper.appendChild(inputLabel);

  const textInput = document.createElement("textarea");
  textInput.id = "affirmationInput";
  textInput.placeholder = "Enter your affirmation...";
  textInput.style.cssText = `
    padding: 12px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--text);
    font-size: 0.9rem;
    font-family: 'DM Mono', monospace;
    resize: vertical;
    min-height: 60px;
    max-height: 120px;
  `;
  inputWrapper.appendChild(textInput);

  const categoryLabel = document.createElement("label");
  categoryLabel.textContent = "Category:";
  categoryLabel.style.cssText = `
    font-size: 0.85rem;
    color: var(--text2);
    font-family: 'DM Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  `;
  inputWrapper.appendChild(categoryLabel);

  const categorySelect = document.createElement("select");
  categorySelect.id = "affirmationCategory";
  categorySelect.style.cssText = `
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--text);
    font-size: 0.9rem;
    font-family: 'DM Mono', monospace;
  `;

  ["Startup Guidelines", "Mindset & Focus", "Daily Execution"].forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
  inputWrapper.appendChild(categorySelect);
  formContainer.appendChild(inputWrapper);

  const addBtn = document.createElement("button");
  addBtn.textContent = "➕ Add Affirmation";
  addBtn.style.cssText = `
    padding: 10px 16px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    align-self: flex-start;
  `;
  addBtn.addEventListener("click", () => {
    const text = textInput.value.trim();
    const category = categorySelect.value;

    if (!text) {
      showToast("Please enter an affirmation", "error");
      return;
    }

    addAffirmation(text, category);
    textInput.value = "";
    renderAffirmationsFullPage();
    showToast("Affirmation added!", "success");
  });
  formContainer.appendChild(addBtn);
  container.appendChild(formContainer);

  // Content area
  if (affirmations.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.style.cssText = `
      text-align: center;
      padding: 60px 20px;
      color: var(--text3);
    `;
    emptyState.innerHTML = `<p>No affirmations yet. Add your first one above!</p>`;
    container.appendChild(emptyState);
  } else {
    // Group by category
    const categories = ["Startup Guidelines", "Mindset & Focus", "Daily Execution"];
    
    categories.forEach((category) => {
      const catAffirmations = affirmations.filter((a) => a.category === category);
      
      if (catAffirmations.length === 0) return;

      const categorySection = document.createElement("div");
      categorySection.style.cssText = `
        margin-bottom: 24px;
      `;

      const categoryTitle = document.createElement("div");
      categoryTitle.style.cssText = `
        font-family: 'DM Serif Display', serif;
        font-size: 1rem;
        font-weight: 600;
        color: var(--text);
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--border);
      `;

      const icons = {
        "Startup Guidelines": "🚀",
        "Mindset & Focus": "🧠",
        "Daily Execution": "⚡",
      };
      categoryTitle.textContent = `${icons[category]} ${category}`;
      categorySection.appendChild(categoryTitle);

      const itemsContainer = document.createElement("div");
      itemsContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;

      catAffirmations.forEach((aff, idx) => {
        const item = document.createElement("div");
        item.style.cssText = `
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          transition: all 0.2s;
        `;

        const numberBadge = document.createElement("div");
        numberBadge.style.cssText = `
          min-width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent);
          color: white;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 700;
          font-family: 'DM Mono', monospace;
        `;
        numberBadge.textContent = idx + 1;
        item.appendChild(numberBadge);

        const textContainer = document.createElement("div");
        textContainer.style.cssText = `
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        `;

        const text = document.createElement("div");
        text.style.cssText = `
          font-size: 0.9rem;
          color: var(--text);
          line-height: 1.5;
        `;
        text.textContent = aff.text;
        textContainer.appendChild(text);

        const meta = document.createElement("div");
        meta.style.cssText = `
          font-size: 0.72rem;
          color: var(--text3);
          font-family: 'DM Mono', monospace;
        `;
        meta.textContent = `Added ${new Date(aff.createdAt).toLocaleDateString()}`;
        textContainer.appendChild(meta);

        item.appendChild(textContainer);

        const buttonGroup = document.createElement("div");
        buttonGroup.style.cssText = `
          display: flex;
          gap: 6px;
          align-items: center;
        `;

        // Move up button
        const upBtn = document.createElement("button");
        upBtn.textContent = "↑";
        upBtn.title = "Move up";
        upBtn.style.cssText = `
          width: 32px;
          height: 32px;
          padding: 0;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text2);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        upBtn.addEventListener("click", () => {
          moveAffirmationUp(aff.id);
          renderAffirmationsFullPage();
        });
        buttonGroup.appendChild(upBtn);

        // Move down button
        const downBtn = document.createElement("button");
        downBtn.textContent = "↓";
        downBtn.title = "Move down";
        downBtn.style.cssText = `
          width: 32px;
          height: 32px;
          padding: 0;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text2);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        downBtn.addEventListener("click", () => {
          moveAffirmationDown(aff.id);
          renderAffirmationsFullPage();
        });
        buttonGroup.appendChild(downBtn);

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "✕";
        deleteBtn.title = "Delete";
        deleteBtn.style.cssText = `
          width: 32px;
          height: 32px;
          padding: 0;
          border: 1px solid var(--accent-light);
          background: var(--surface);
          color: var(--accent);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 1rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (confirm("Delete this affirmation?")) {
            deleteAffirmation(aff.id);
            renderAffirmationsFullPage();
            showToast("Affirmation deleted", "success");
          }
        });
        buttonGroup.appendChild(deleteBtn);

        item.appendChild(buttonGroup);
        itemsContainer.appendChild(item);
      });

      categorySection.appendChild(itemsContainer);
      container.appendChild(categorySection);
    });
  }
}

function openAffirmationsFullPage() {
  renderAffirmationsFullPage();
  document.getElementById("affirmationsFullPageModal").style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeAffirmationsFullPage() {
  document.getElementById("affirmationsFullPageModal").style.display = "none";
  document.body.style.overflow = "auto";
}

function renderRuleOfThree() {
  console.log("🎨 ========== renderRuleOfThree() START ==========");
  const container = document.getElementById("ruleOfThreeWidget");
  if (!container) {
    console.error("❌ ruleOfThreeWidget container NOT FOUND");
    return;
  }
  console.log("✓ Container found, clearing...");

  clearChildren(container);

  const people = ["Vivek", "Mirat", "Chirag"];
  console.log("📋 About to render tasks for", people.length, "people");
  
  people.forEach((person) => {
    const tasks = getRuleOfThreeByPerson(person);
    console.log(`🎯 Rendering for ${person}:`, tasks.length, "tasks");
    
    const card = document.createElement("div");
    card.style.cssText = `
      background: var(--personal-light);
      border: 1px solid var(--personal);
      border-radius: var(--radius-sm);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;

    const header = document.createElement("div");
    header.style.cssText = `
      font-family: 'DM Mono', monospace;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--personal);
      font-weight: 700;
      margin-bottom: 4px;
    `;
    header.textContent = `🎯 Rule of 3 — Vivarta Tech`;
    card.appendChild(header);

    const personName = document.createElement("div");
    personName.style.cssText = `
      font-weight: 600;
      color: var(--text);
      font-size: 0.95rem;
      margin-bottom: 8px;
    `;
    personName.textContent = person;
    card.appendChild(personName);

    if (tasks.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = "color:var(--text3);font-size:0.85rem;text-align:center;padding:12px";
      empty.textContent = "No tasks yet";
      card.appendChild(empty);
    } else {
      tasks.forEach((task, idx) => {
        const taskEl = document.createElement("div");
        taskEl.style.cssText = `
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 8px;
          background: rgba(255,255,255,0.4);
          border-radius: 6px;
          opacity: 0;
          animation: slideIn 0.3s ease forwards;
          animation-delay: ${idx * 0.1}s;
        `;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.style.cssText = "margin-top:2px;cursor:pointer;width:16px;height:16px";
        checkbox.onchange = () => {
          toggleRuleOfThreeTask(task.id);
          renderRuleOfThree();
        };
        taskEl.appendChild(checkbox);

        const taskText = document.createElement("div");
        taskText.style.cssText = `
          flex: 1;
          font-size: 0.85rem;
          color: var(--text);
          ${task.completed ? "text-decoration: line-through; color: var(--text3);" : ""}
        `;
        taskText.textContent = task.task;
        taskEl.appendChild(taskText);

        const deleteBtn = document.createElement("button");
        deleteBtn.style.cssText = `
          background: none;
          border: none;
          color: var(--text3);
          cursor: pointer;
          padding: 0;
          font-size: 0.8rem;
          opacity: 0;
          transition: all 0.2s;
        `;
        deleteBtn.innerHTML = "✕";
        deleteBtn.onmouseover = () => deleteBtn.style.opacity = "1";
        deleteBtn.onmouseout = () => deleteBtn.style.opacity = "0";
        deleteBtn.onclick = () => {
          deleteRuleOfThreeTask(task.id);
          renderRuleOfThree();
        };
        taskEl.appendChild(deleteBtn);

        taskEl.onmouseover = () => deleteBtn.style.opacity = "1";
        taskEl.onmouseout = () => deleteBtn.style.opacity = "0";

        card.appendChild(taskEl);
      });
    }

    // Add "Add Task" button
    const addBtn = document.createElement("button");
    addBtn.style.cssText = `
      background: var(--personal);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 8px;
    `;
    addBtn.textContent = "+ Add Task";
    addBtn.className = "rule3-add-btn";
    addBtn.setAttribute("data-person", person);
    console.log(`   ✅ Created "+ Add Task" button for ${person}`);
    
    addBtn.onmouseover = () => addBtn.style.background = "var(--entre)";
    addBtn.onmouseout = () => addBtn.style.background = "var(--personal)";
    
    addBtn.onclick = (e) => {
      console.log("🖱️  BUTTON CLICKED for " + person);
      console.log("   event:", e);
      console.log("   openRuleOfThreeModal function exists:", typeof openRuleOfThreeModal);
      
      // Pre-select the person in the modal
      const personSelect = document.getElementById("ruleOfThreePersonSelect");
      if (personSelect) {
        personSelect.value = person;
        console.log("   ✅ Pre-selected person:", person);
      } else {
        console.warn("   ❌ personSelect NOT FOUND");
      }
      
      console.log("   📞 Calling openRuleOfThreeModal()...");
      openRuleOfThreeModal();
      
      // Focus on task input
      setTimeout(() => {
        const taskInput = document.getElementById("ruleOfThreeTaskInput");
        if (taskInput) {
          taskInput.focus();
          console.log("   ✅ Task input focused");
        } else {
          console.warn("   ❌ taskInput NOT FOUND");
        }
      }, 50);
    };
    card.appendChild(addBtn);

    container.appendChild(card);
  });
  
  console.log("🎨 ========== renderRuleOfThree() COMPLETE ==========");
}

function initRuleOfThreeForm() {
  console.log("🔧 ========== initRuleOfThreeForm() START ==========");
  
  const form = document.getElementById("ruleOfThreeModal");
  if (!form) {
    console.error("❌ ruleOfThreeModal NOT found in DOM");
    return;
  }
  console.log("✓ Form modal found");

  const personSelect = document.getElementById("ruleOfThreePersonSelect");
  const taskInput = document.getElementById("ruleOfThreeTaskInput");
  const saveBtn = document.getElementById("btnRuleOfThreeSave");
  const cancelBtn = document.getElementById("btnRuleOfThreeCancel");

  console.log("Form element check:", {
    personSelect: !!personSelect,
    taskInput: !!taskInput,
    saveBtn: !!saveBtn,
    cancelBtn: !!cancelBtn
  });

  if (saveBtn) {
    console.log("📌 Attaching click listener to save button");
    
    // Create handler function
    const handleSaveClick = function(e) {
      console.log("🖱️  ====== SAVE BUTTON CLICK DETECTED ======");
      e.preventDefault();
      e.stopPropagation();

      const person = personSelect.value.trim();
      const task = taskInput.value.trim();

      console.log("   📋 Form values:", { person, task });

      if (!person || !task) {
        console.warn("❌ VALIDATION FAILED - person or task empty");
        console.log("   person:", JSON.stringify(person), "| task:", JSON.stringify(task));
        alert("Please select a person and enter a task");
        return;
      }

      console.log("✅ VALIDATION PASSED - calling addRuleOfThreeTask");
      addRuleOfThreeTask(person, task);
      console.log("✓ addRuleOfThreeTask completed");
      
      console.log("Calling renderRuleOfThree()");
      renderRuleOfThree();
      console.log("✓ Re-render complete");

      personSelect.value = "";
      taskInput.value = "";
      closeRuleOfThreeModal();
      console.log("✅ Modal closed and form cleared");
    };
    
    // Remove old listener if exists and add new one
    saveBtn.removeEventListener("click", window.ruleOfThreeSaveHandler);
    saveBtn.addEventListener("click", handleSaveClick);
    window.ruleOfThreeSaveHandler = handleSaveClick;
    
    console.log("✅ Click handler successfully attached to save button");
  } else {
    console.error("❌ Save button NOT FOUND in DOM");
  }

  if (cancelBtn) {
    cancelBtn.removeEventListener("click", window.ruleOfThreeCancelHandler);
    const handleCancelClick = closeRuleOfThreeModal;
    cancelBtn.addEventListener("click", handleCancelClick);
    window.ruleOfThreeCancelHandler = handleCancelClick;
    console.log("✅ Cancel handler attached");
  }
  
  console.log("🔧 ========== initRuleOfThreeForm() COMPLETE ==========");
}

function openRuleOfThreeModal() {
  console.log("📖 openRuleOfThreeModal() called");
  const modal = document.getElementById("ruleOfThreeModal");
  console.log("   modal element found:", !!modal);
  if (modal) {
    console.log("   Adding 'show' class...");
    modal.classList.add("show");
    console.log("   ✅ Modal should be visible now");
    
    const personSelect = document.getElementById("ruleOfThreePersonSelect");
    console.log("   personSelect found:", !!personSelect);
    if (personSelect) {
      personSelect.focus();
      console.log("   ✅ Focused on personSelect");
    }
  } else {
    console.error("❌ ruleOfThreeModal NOT FOUND!");
  }
}

function closeRuleOfThreeModal() {
  console.log("🚫 closeRuleOfThreeModal() called");
  const modal = document.getElementById("ruleOfThreeModal");
  if (modal) {
    modal.classList.remove("show");
    console.log("   ✅ Modal closed");
  }
}

// ============================================
// APP INITIALIZATION (from app.js)
// ============================================

function initializeDefaultAffirmations() {
  if (appState.affirmations.length > 0) return;

  const defaultAffirmations = [
    { text: "Spend 30 min in library — new ideas & latest happenings", category: "Startup Guidelines" },
    { text: "Focus on Government Schemes for Grants — knowledge + due dates", category: "Startup Guidelines" },
    { text: "Watch Shark Tank videos — study pitches and business models", category: "Startup Guidelines" },
    { text: "Study business case studies — learn from successes and failures", category: "Startup Guidelines" },
    { text: "Maintain a learning notebook — startup learnings, AI tools, Design Thinking", category: "Startup Guidelines" },
    { text: "Maintain a networking notebook — contacts, conversations, follow-ups", category: "Startup Guidelines" },
    { text: "3 Factors of Success (3M's) — Money, Market, Mindset", category: "Startup Guidelines" },
    { text: "Use TRIZ & LEAN model effectively", category: "Startup Guidelines" },
    { text: "If product fails during testing → Empathize and iterate", category: "Startup Guidelines" },
    { text: "Everything happens twice — first in mind, then in reality → Power of visualization", category: "Mindset & Focus" },
    { text: "Apart from what you want to achieve, everything else is noise", category: "Mindset & Focus" },
    { text: "Watch your thoughts — keep what matters, remove noise", category: "Mindset & Focus" },
    { text: "Read one CAD/CAE article daily", category: "Daily Execution" },
    { text: "Post one article weekly on LinkedIn", category: "Daily Execution" },
    { text: "Explore guest lecture opportunities", category: "Daily Execution" },
    { text: "Read NVIDIA blogs", category: "Daily Execution" },
  ];

  defaultAffirmations.forEach((aff) => {
    appState.affirmations.push({
      id: generateId(),
      text: aff.text,
      category: aff.category,
      createdAt: new Date().toISOString(),
    });
  });

  saveState();
}

function initializeApp() {
  // Only load from localStorage if NOT using Supabase cloud mode
  // (Supabase already loaded data into window.appState)
  if (!window.supabaseReady) {
    console.log("📂 Loading state from localStorage...");
    loadState();
  } else {
    console.log("☁️  Using Supabase-loaded state (skipping localStorage)");
    // CRITICAL: Sync window.appState (set by Supabase) back to local appState variable
    // so that when initializeDefaultAffirmations() calls saveState(), it saves the correct data
    if (window.appState) {
      console.log("🔄 Syncing window.appState to local appState variable...");
      console.log("   🎯 window.appState.ruleOfThree before sync:", window.appState.ruleOfThree?.length || 0, "tasks");
      console.log("   📋 window.appState.teamTasks before sync:", Object.keys(window.appState.teamTasks || {}).length, "people");
      console.log("   📊 window.appState.teamTasks CONTENT before sync:", JSON.stringify(window.appState.teamTasks, null, 2));
      // Copy all properties from window.appState to the local appState
      Object.keys(window.appState).forEach(key => {
        appState[key] = window.appState[key];
      });
      console.log("✓ Local appState synchronized with Supabase data");
      console.log("   ruleOfThree length:", appState.ruleOfThree?.length || 0);
      if (appState.ruleOfThree && appState.ruleOfThree.length > 0) {
        console.log("   🎯 Rule Of Three tasks loaded:", appState.ruleOfThree.map(t => `${t.person}: ${t.task}`).join(", "));
      }
      console.log("   teamTasks keys:", Object.keys(appState.teamTasks || {}));
      console.log("   📊 appState.teamTasks CONTENT after sync:", JSON.stringify(appState.teamTasks, null, 2));
    }
  }
  
  initializeDefaultAffirmations();
  initializeWidgets();
  window.addEventListener("stateChange", handleStateChange);
  console.log("✓ Vivarta dashboard initialized");
}

function initializeWidgets() {
  console.log("🚀 ========== initializeWidgets() START ==========");
  
  console.log("📍 About to render Timeline");
  renderTimeline();
  initTimelineForm();

  console.log("📍 About to render Meetings");
  renderMeetings();
  initMeetingsForm();

  console.log("📍 About to render Contacts");
  renderContacts();
  initNetworkingForm();

  console.log("📍 About to render FutureEvents");
  renderFutureEvents();
  initFutureEventsForm();

  console.log("📍 About to render Rule Of Three");
  renderRuleOfThree();
  console.log("✓ renderRuleOfThree() done");
  
  console.log("📍 About to init Rule Of Three Form");
  initRuleOfThreeForm();
  console.log("✓ initRuleOfThreeForm() done");
  
  console.log("🚀 ========== initializeWidgets() COMPLETE ==========");
}

function handleStateChange(event) {
  const { type } = event.detail;

  if (type.startsWith("timeline:")) {
    renderTimeline();
  } else if (type.startsWith("meetings:")) {
    renderMeetings();
  } else if (type.startsWith("contacts:")) {
    renderContacts();
  } else if (type.startsWith("futureEvents:")) {
    renderFutureEvents();
  } else if (type.startsWith("ruleOfThree:")) {
    renderRuleOfThree();
  }
}

// ============================================
// FULL-PAGE MODAL VIEWS
// ============================================

function renderTimelineFullPage() {
  const container = document.getElementById("timelineFullPageContent");
  if (!container) return;

  clearChildren(container);
  const events = getTimelineEvents();

  if (events.length === 0) {
    container.innerHTML = `<p style="color:var(--text3);text-align:center;padding:40px">No events yet.</p>`;
    return;
  }

  const timeline = document.createElement("div");
  timeline.style.cssText = "position:relative;padding:20px 0;padding-left:36px";

  const line = document.createElement("div");
  line.style.cssText = "position:absolute;left:12px;top:0;bottom:0;width:2px;background:linear-gradient(180deg,var(--accent),transparent);border-radius:2px";
  timeline.appendChild(line);

  events.forEach((event, idx) => {
    const isMajor = event.type === "major";
    const eventEl = document.createElement("div");
    eventEl.style.cssText = `margin-bottom:20px;position:relative;opacity:0;animation:fadeInUp 0.4s ease forwards;animation-delay:${idx * 0.1}s`;

    const dot = document.createElement("div");
    dot.style.cssText = `position:absolute;left:-26px;top:4px;width:14px;height:14px;border-radius:50%;background:${isMajor ? "var(--accent)" : "var(--text3)"};border:3px solid var(--surface);box-shadow:0 0 0 3px ${isMajor ? "var(--accent-light)" : "transparent"}`;
    eventEl.appendChild(dot);

    const content = document.createElement("div");
    content.style.cssText = `background:${isMajor ? "var(--accent-light)" : "var(--surface2)"};border:1px solid ${isMajor ? "var(--accent)" : "var(--border)"};border-radius:var(--radius-sm);padding:12px 14px`;

    const title = document.createElement("div");
    title.style.cssText = "font-weight:600;color:var(--text);font-size:0.95rem;margin-bottom:6px";
    title.textContent = event.title;
    content.appendChild(title);

    const meta = document.createElement("div");
    meta.style.cssText = "display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:0.75rem";
    const dateSpan = document.createElement("span");
    dateSpan.style.cssText = "color:var(--text3);font-family:'DM Mono',monospace";
    dateSpan.textContent = formatDate(event.date);
    meta.appendChild(dateSpan);
    const typeBadge = document.createElement("span");
    typeBadge.style.cssText = `padding:1px 6px;border-radius:12px;font-family:'DM Mono',monospace;font-weight:600;background:${isMajor ? "var(--accent)" : "var(--border)"};color:${isMajor ? "#fff" : "var(--text3)"}`;
    typeBadge.textContent = isMajor ? "MAJOR" : "minor";
    meta.appendChild(typeBadge);
    content.appendChild(meta);

    if (event.description) {
      const desc = document.createElement("div");
      desc.style.cssText = "font-size:0.85rem;color:var(--text2);line-height:1.5;margin-bottom:8px";
      desc.textContent = event.description;
      content.appendChild(desc);
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.style.cssText = "background:none;border:none;color:var(--text3);font-size:0.75rem;cursor:pointer;padding:2px 4px;border-radius:4px;transition:all 0.2s";
    deleteBtn.innerHTML = "✕ Remove";
    deleteBtn.onclick = () => {
      deleteTimelineEvent(event.id);
      renderTimelineFullPage();
    };
    content.appendChild(deleteBtn);

    eventEl.appendChild(content);
    timeline.appendChild(eventEl);
  });

  container.appendChild(timeline);
}

function renderMeetingsFullPage() {
  const container = document.getElementById("meetingsFullPageContent");
  if (!container) return;

  clearChildren(container);
  const upcoming = getMeetingsByStatus("upcoming");
  const completed = getMeetingsByStatus("completed");

  if (upcoming.length === 0 && completed.length === 0) {
    container.innerHTML = `<p style="color:var(--text3);text-align:center;padding:40px">No meetings yet.</p>`;
    return;
  }

  const wrapper = document.createElement("div");

  if (upcoming.length > 0) {
    const section = document.createElement("div");
    section.style.cssText = "margin-bottom:32px";
    const title = document.createElement("h2");
    title.style.cssText = "font-size:1.1rem;margin-bottom:16px;color:var(--accent);font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;font-weight:600";
    title.textContent = `📌 Upcoming (${upcoming.length})`;
    section.appendChild(title);

    upcoming.forEach(meeting => {
      const card = document.createElement("div");
      card.style.cssText = "background:var(--accent-light);border:1px solid var(--accent);border-radius:var(--radius-sm);padding:14px;margin-bottom:10px";

      const mtitle = document.createElement("div");
      mtitle.style.cssText = "font-weight:600;color:var(--text);margin-bottom:6px";
      mtitle.textContent = meeting.title;
      card.appendChild(mtitle);

      const meta = document.createElement("div");
      meta.style.cssText = "display:flex;align-items:center;gap:12px;margin-bottom:8px;font-size:0.8rem;color:var(--text2)";
      meta.innerHTML = `<span>${meeting.person}</span><span>•</span><span>${formatDate(meeting.date)}</span>`;
      card.appendChild(meta);

      if (meeting.notes) {
        const notes = document.createElement("div");
        notes.style.cssText = "font-size:0.85rem;color:var(--text2);margin-bottom:8px;padding:8px;background:rgba(0,0,0,0.02);border-radius:6px";
        notes.textContent = meeting.notes;
        card.appendChild(notes);
      }

      const actions = document.createElement("div");
      actions.style.cssText = "display:flex;gap:8px";

      const toggleBtn = document.createElement("button");
      toggleBtn.style.cssText = "background:var(--accent);color:#fff;border:none;padding:4px 10px;border-radius:6px;font-size:0.75rem;cursor:pointer";
      toggleBtn.textContent = "✓ Complete";
      toggleBtn.onclick = () => {
        toggleMeetingStatus(meeting.id);
        renderMeetingsFullPage();
      };
      actions.appendChild(toggleBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.style.cssText = "background:none;border:none;color:var(--text3);font-size:0.75rem;cursor:pointer;padding:4px;border-radius:4px";
      deleteBtn.textContent = "✕";
      deleteBtn.onclick = () => {
        deleteMeeting(meeting.id);
        renderMeetingsFullPage();
      };
      actions.appendChild(deleteBtn);

      card.appendChild(actions);
      section.appendChild(card);
    });
    wrapper.appendChild(section);
  }

  if (completed.length > 0) {
    const section = document.createElement("div");
    section.style.cssText = "margin-bottom:32px";
    const title = document.createElement("h2");
    title.style.cssText = "font-size:1.1rem;margin-bottom:16px;color:var(--text3);font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;font-weight:600";
    title.textContent = `✓ Completed (${completed.length})`;
    section.appendChild(title);

    completed.forEach(meeting => {
      const card = document.createElement("div");
      card.style.cssText = "background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;margin-bottom:10px;opacity:0.7";

      const mtitle = document.createElement("div");
      mtitle.style.cssText = "font-weight:600;color:var(--text);margin-bottom:6px;text-decoration:line-through";
      mtitle.textContent = meeting.title;
      card.appendChild(mtitle);

      const meta = document.createElement("div");
      meta.style.cssText = "display:flex;align-items:center;gap:12px;margin-bottom:8px;font-size:0.8rem;color:var(--text2)";
      meta.innerHTML = `<span>${meeting.person}</span><span>•</span><span>${formatDate(meeting.date)}</span>`;
      card.appendChild(meta);

      const deleteBtn = document.createElement("button");
      deleteBtn.style.cssText = "background:none;border:none;color:var(--text3);font-size:0.75rem;cursor:pointer;padding:4px;margin-top:8px";
      deleteBtn.textContent = "✕ Remove";
      deleteBtn.onclick = () => {
        deleteMeeting(meeting.id);
        renderMeetingsFullPage();
      };
      card.appendChild(deleteBtn);

      section.appendChild(card);
    });
    wrapper.appendChild(section);
  }

  container.appendChild(wrapper);
}

function renderNetworkingFullPage() {
  const container = document.getElementById("networkingFullPageContent");
  if (!container) return;

  clearChildren(container);
  const contacts = getAllContacts();

  if (contacts.length === 0) {
    container.innerHTML = `<p style="color:var(--text3);text-align:center;padding:40px">No contacts yet.</p>`;
    return;
  }

  const wrapper = document.createElement("div");
  contacts.forEach((contact, idx) => {
    const card = document.createElement("div");
    card.style.cssText = `background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;margin-bottom:12px;opacity:0;animation:slideIn 0.3s ease forwards;animation-delay:${idx * 0.05}s`;

    const name = document.createElement("div");
    name.style.cssText = "font-weight:600;color:var(--text);font-size:0.95rem;margin-bottom:4px";
    name.textContent = contact.name;
    card.appendChild(name);

    const role = document.createElement("div");
    role.style.cssText = "font-size:0.8rem;color:var(--accent);font-family:'DM Mono',monospace;margin-bottom:6px";
    role.textContent = `${contact.role} @ ${contact.company}`;
    card.appendChild(role);

    if (contact.notes) {
      const notes = document.createElement("div");
      notes.style.cssText = "font-size:0.8rem;color:var(--text2);margin-bottom:8px;padding:8px;background:rgba(0,0,0,0.02);border-radius:6px";
      notes.textContent = contact.notes;
      card.appendChild(notes);
    }

    const meta = document.createElement("div");
    meta.style.cssText = "display:flex;justify-content:space-between;align-items:center;font-size:0.7rem;color:var(--text3);margin-top:8px";
    meta.innerHTML = `<span>Last contact: ${formatDate(contact.lastContact)}</span>`;
    card.appendChild(meta);

    const deleteBtn = document.createElement("button");
    deleteBtn.style.cssText = "background:none;border:none;color:var(--text3);font-size:0.75rem;cursor:pointer;padding:4px;margin-top:8px";
    deleteBtn.textContent = "✕ Remove";
    deleteBtn.onclick = () => {
      deleteContact(contact.id);
      renderNetworkingFullPage();
    };
    card.appendChild(deleteBtn);

    wrapper.appendChild(card);
  });

  container.appendChild(wrapper);
}

function renderFutureEventsFullPage() {
  const container = document.getElementById("futureEventsFullPageContent");
  if (!container) return;

  clearChildren(container);
  const events = getFutureEvents();

  if (events.length === 0) {
    container.innerHTML = `<p style="color:var(--text3);text-align:center;padding:40px">No events yet.</p>`;
    return;
  }

  const wrapper = document.createElement("div");

  const highPriority = events.filter((e) => e.priority === "high");
  const mediumPriority = events.filter((e) => e.priority === "medium");
  const lowPriority = events.filter((e) => e.priority === "low");

  const renderSection = (label, color, items) => {
    if (items.length === 0) return;

    const section = document.createElement("div");
    section.style.cssText = "margin-bottom:32px";

    const header = document.createElement("h2");
    header.style.cssText = `font-size:1.1rem;margin-bottom:16px;color:${color};font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;font-weight:600`;
    header.textContent = `${label} (${items.length})`;
    section.appendChild(header);

    items.forEach((event, idx) => {
      const days = daysUntil(event.date);
      const card = document.createElement("div");
      card.style.cssText = `background:${color === "var(--red)" ? "var(--red-light)" : color === "var(--gold)" ? "var(--gold-light)" : "var(--accent2-light)"};border:1px solid ${color};border-radius:var(--radius-sm);padding:14px;margin-bottom:12px;opacity:0;animation:slideIn 0.3s ease forwards;animation-delay:${idx * 0.05}s`;

      const etitle = document.createElement("div");
      etitle.style.cssText = "font-weight:600;color:var(--text);font-size:0.95rem;margin-bottom:6px";
      etitle.textContent = event.title;
      card.appendChild(etitle);

      const meta = document.createElement("div");
      meta.style.cssText = "display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:0.75rem";

      let urgencyLabel = "";
      if (days < 0) {
        urgencyLabel = `OVERDUE (${Math.abs(days)}d ago)`;
      } else if (days === 0) {
        urgencyLabel = "TODAY";
      } else if (days <= 3) {
        urgencyLabel = `IN ${days} DAYS`;
      } else {
        urgencyLabel = formatDateShort(event.date);
      }

      const urgency = document.createElement("span");
      urgency.style.cssText = `padding:2px 8px;border-radius:12px;background:${color};color:#fff;font-family:'DM Mono',monospace;font-weight:600`;
      urgency.textContent = urgencyLabel;
      meta.appendChild(urgency);

      card.appendChild(meta);

      if (event.preparationNotes) {
        const notes = document.createElement("div");
        notes.style.cssText = "font-size:0.85rem;color:var(--text2);margin-bottom:8px;padding:8px;background:rgba(0,0,0,0.02);border-radius:6px";
        notes.innerHTML = `<strong style="font-size:0.75rem;color:var(--text3)">Prep:</strong> <div style="margin-top:4px">${event.preparationNotes}</div>`;
        card.appendChild(notes);
      }

      const deleteBtn = document.createElement("button");
      deleteBtn.style.cssText = "background:none;border:none;color:var(--text3);font-size:0.75rem;cursor:pointer;padding:4px;margin-top:8px";
      deleteBtn.textContent = "✕ Remove";
      deleteBtn.onclick = () => {
        deleteFutureEvent(event.id);
        renderFutureEventsFullPage();
      };
      card.appendChild(deleteBtn);

      section.appendChild(card);
    });

    wrapper.appendChild(section);
  };

  renderSection("🔴 CRITICAL", "var(--red)", highPriority);
  renderSection("🟠 IMPORTANT", "var(--gold)", mediumPriority);
  renderSection("🟢 LOW PRIORITY", "var(--accent2)", lowPriority);

  container.appendChild(wrapper);
}

function openTimelineFullPage() {
  renderTimelineFullPage();
  document.getElementById("timelineFullPageModal").style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeTimelineFullPage() {
  document.getElementById("timelineFullPageModal").style.display = "none";
  document.body.style.overflow = "auto";
}

function openMeetingsFullPage() {
  renderMeetingsFullPage();
  document.getElementById("meetingsFullPageModal").style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeMeetingsFullPage() {
  document.getElementById("meetingsFullPageModal").style.display = "none";
  document.body.style.overflow = "auto";
}

function openNetworkingFullPage() {
  renderNetworkingFullPage();
  document.getElementById("networkingFullPageModal").style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeNetworkingFullPage() {
  document.getElementById("networkingFullPageModal").style.display = "none";
  document.body.style.overflow = "auto";
}

function openFutureEventsFullPage() {
  renderFutureEventsFullPage();
  document.getElementById("futureEventsFullPageModal").style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeFutureEventsFullPage() {
  document.getElementById("futureEventsFullPageModal").style.display = "none";
  document.body.style.overflow = "auto";
}

function initializeFullPageModals() {
  document.getElementById("closeTimelineModal")?.addEventListener("click", closeTimelineFullPage);
  document.getElementById("closeMeetingsModal")?.addEventListener("click", closeMeetingsFullPage);
  document.getElementById("closeNetworkingModal")?.addEventListener("click", closeNetworkingFullPage);
  document.getElementById("closeFutureEventsModal")?.addEventListener("click", closeFutureEventsFullPage);
  document.getElementById("closeAffirmationsModal")?.addEventListener("click", closeAffirmationsFullPage);

  document.getElementById("timelineFullPageModal")?.addEventListener("click", (e) => {
    if (e.target === document.getElementById("timelineFullPageModal")) closeTimelineFullPage();
  });
  document.getElementById("meetingsFullPageModal")?.addEventListener("click", (e) => {
    if (e.target === document.getElementById("meetingsFullPageModal")) closeMeetingsFullPage();
  });
  document.getElementById("networkingFullPageModal")?.addEventListener("click", (e) => {
    if (e.target === document.getElementById("networkingFullPageModal")) closeNetworkingFullPage();
  });
  document.getElementById("futureEventsFullPageModal")?.addEventListener("click", (e) => {
    if (e.target === document.getElementById("futureEventsFullPageModal")) closeFutureEventsFullPage();
  });
  document.getElementById("affirmationsFullPageModal")?.addEventListener("click", (e) => {
    if (e.target === document.getElementById("affirmationsFullPageModal")) closeAffirmationsFullPage();
  });
}

// Auto-initialize (wait for Supabase if available)
function startDashboard() {
  console.log("🎬 Starting dashboard initialization...");
  initializeApp();
  initializeFullPageModals();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    // Wait for Supabase to load data (if in cloud mode)
    if (window.supabaseConfig?.supabase && !window.supabaseReady) {
      console.log("⏳ Waiting for Supabase to load data...");
      let checkCount = 0;
      const waitForSupabase = setInterval(() => {
        checkCount++;
        if (window.supabaseReady) {
          console.log("✅ Supabase ready, starting dashboard");
          clearInterval(waitForSupabase);
          startDashboard();
        } else if (checkCount > 100) {
          // Timeout after 5 seconds - proceed anyway
          console.warn("⚠️  Supabase timeout, starting with empty state");
          clearInterval(waitForSupabase);
          startDashboard();
        }
      }, 50);
    } else {
      startDashboard();
    }
  });
} else {
  // Page already loaded
  if (window.supabaseConfig?.supabase && !window.supabaseReady) {
    console.log("⏳ Waiting for Supabase to load data...");
    let checkCount = 0;
    const waitForSupabase = setInterval(() => {
      checkCount++;
      if (window.supabaseReady) {
        console.log("✅ Supabase ready, starting dashboard");
        clearInterval(waitForSupabase);
        startDashboard();
      } else if (checkCount > 100) {
        console.warn("⚠️  Supabase timeout, starting with empty state");
        clearInterval(waitForSupabase);
        startDashboard();
      }
    }, 50);
  } else {
    startDashboard();
  }
}
