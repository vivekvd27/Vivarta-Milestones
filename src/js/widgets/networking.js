/**
 * NETWORKING CRM WIDGET
 * Store and manage contacts (people met, roles, companies)
 */

import {
  appState,
  generateId,
  formatDate,
  saveState,
  dispatchStateChange,
} from "../state.js";
import { escapeHtml, clearChildren, formatDateShort } from "../utils.js";

// Track expanded state for view all functionality
let networkingExpanded = false;

/**
 * Toggle networking expanded state
 */
export function toggleNetworkingExpanded() {
  networkingExpanded = !networkingExpanded;
  renderContacts();
}

/**
 * Add a contact
 */
export function addContact(name, role, company, notes = "") {
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

/**
 * Update contact last interaction
 */
export function updateContactLastInteraction(contactId) {
  const contact = appState.contacts.find((c) => c.id === contactId);
  if (contact) {
    contact.lastContact = new Date().toISOString().split("T")[0];
    saveState();
    dispatchStateChange("contacts:update", contact);
  }
}

/**
 * Delete contact
 */
export function deleteContact(contactId) {
  appState.contacts = appState.contacts.filter((c) => c.id !== contactId);
  saveState();
  dispatchStateChange("contacts:delete", contactId);
}

/**
 * Search contacts
 */
export function searchContacts(query) {
  const q = query.toLowerCase();
  return appState.contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q)
  );
}

/**
 * Get all contacts sorted by last contact
 */
export function getAllContacts() {
  return [...appState.contacts].sort(
    (a, b) => new Date(b.lastContact) - new Date(a.lastContact)
  );
}

/**
 * Render networking widget
 */
export function renderContacts() {
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

  // Search bar
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

  searchInput.oninput = (e) => {
    const query = e.target.value;
    const results = query ? searchContacts(query) : contacts;
    renderContactsList(contactsList, results);
  };

  searchBar.appendChild(searchInput);
  container.appendChild(searchBar);

  // Contacts list
  const contactsList = document.createElement("div");
  contactsList.style.cssText = "display:flex;flex-direction:column;gap:10px";
  container.appendChild(contactsList);

  renderContactsList(contactsList, contacts);
}

/**
 * Render contacts list (helper function)
 */
function renderContactsList(container, contacts) {
  clearChildren(container);

  if (contacts.length === 0) {
    container.innerHTML =
      '<div style="padding:12px;text-align:center;color:var(--text3);font-size:0.82rem">No contacts found</div>';
    return;
  }

  // Show max 5 contacts (unless expanded)
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

    // Header
    const header = document.createElement("div");
    header.style.cssText =
      "display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px";

    const nameSection = document.createElement("div");
    nameSection.style.cssText = "flex:1;min-width:0";

    const name = document.createElement("div");
    name.style.cssText =
      "font-weight:600;color:var(--text);font-size:0.88rem;margin-bottom:2px";
    name.textContent = contact.name;
    nameSection.appendChild(name);

    const company = document.createElement("div");
    company.style.cssText =
      "font-size:0.78rem;color:var(--text3);font-family:'DM Mono',monospace";
    company.textContent = contact.company;
    nameSection.appendChild(company);

    header.appendChild(nameSection);

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
      deleteContact(contact.id);
      renderContacts();
    };
    header.appendChild(deleteBtn);

    card.appendChild(header);

    // Role & last contact
    const meta = document.createElement("div");
    meta.style.cssText =
      "display:flex;align-items:center;gap:10px;font-size:0.73rem;color:var(--text2);margin-bottom:8px;flex-wrap:wrap";
    meta.innerHTML = `
      <span style="padding:1px 6px;border-radius:10px;background:var(--accent-light);color:var(--accent)">
        ${escapeHtml(contact.role)}
      </span>
      <span style="color:var(--text3)">Last: ${formatDateShort(contact.lastContact)}</span>
    `;
    card.appendChild(meta);

    // Notes
    if (contact.notes) {
      const notes = document.createElement("div");
      notes.style.cssText =
        "font-size:0.8rem;color:var(--text2);line-height:1.4;border-top:1px solid var(--border);padding-top:8px;margin-top:8px";
      notes.innerHTML = `<span style="color:var(--text3);font-family:'DM Mono',monospace;font-size:0.7rem">Notes:</span><div style="margin-top:2px">${contact.notes}</div>`;
      card.appendChild(notes);
    }

    container.appendChild(card);
  });

  // Add View All button if there are more contacts
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
      toggleNetworkingExpanded();
    };
    container.appendChild(viewAllBtn);
  }

  // Ensure fadeIn animation exists
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

/**
 * Initialize networking form
 */
export function initNetworkingForm() {
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
    const notes = notesInput?.value.trim() || "";

    if (!name || !role || !company) {
      alert("Please fill in name, role, and company");
      return;
    }

    addContact(name, role, company, notes);
    renderContacts();

    // Clear form
    nameInput.value = "";
    roleInput.value = "";
    companyInput.value = "";
    if (notesInput) notesInput.value = "";
  };
}
