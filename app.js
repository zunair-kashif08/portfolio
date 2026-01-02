const yearEl = document.getElementById("year");
yearEl.textContent = new Date().getFullYear();

const tbody = document.getElementById("appsTbody");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const resetBtn = document.getElementById("resetBtn");

const statTotal = document.getElementById("statTotal");
const statApplied = document.getElementById("statApplied");
const statInterview = document.getElementById("statInterview");
const statOffer = document.getElementById("statOffer");

let allApps = [];

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(s) {
  return String(s ?? "").toLowerCase().trim();
}

function statusBadge(status) {
  const safe = escapeHtml(status || "Unknown");
  return `<span class="badge" aria-label="Status: ${safe}">${safe}</span>`;
}

function render(apps) {
  if (!apps.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="muted">No matching applications.</td></tr>`;
    updateStats([]);
    return;
  }

  tbody.innerHTML = apps.map(a => {
    const company = escapeHtml(a.company);
    const industry = escapeHtml(a.industry);
    const role = escapeHtml(a.role);
    const date = escapeHtml(a.date || "");
    const status = statusBadge(a.status);

    let notesCell = "";
    if (a.link) {
      const safeLink = escapeHtml(a.link);
      const safeText = escapeHtml(a.notes || "Open link");
      notesCell = `<a href="${safeLink}" target="_blank" rel="noreferrer">${safeText}</a>`;
    } else {
      notesCell = escapeHtml(a.notes || "");
    }

    return `
      <tr>
        <td><strong>${company}</strong></td>
        <td>${industry}</td>
        <td>${role}</td>
        <td>${date}</td>
        <td>${status}</td>
        <td>${notesCell}</td>
      </tr>
    `;
  }).join("");

  updateStats(apps);
}

function updateStats(apps) {
  const byStatus = (name) => apps.filter(a => normalize(a.status) === normalize(name)).length;

  statTotal.textContent = String(apps.length);
  statApplied.textContent = String(byStatus("Applied"));
  statInterview.textContent = String(byStatus("Interview"));
  statOffer.textContent = String(byStatus("Offer"));
}

function applyFilters() {
  const q = normalize(searchInput.value);
  const status = normalize(statusFilter.value);

  const filtered = allApps.filter(a => {
    const hay = normalize([a.company, a.industry, a.role, a.status, a.notes].join(" "));
    const matchQ = !q || hay.includes(q);
    const matchS = !status || normalize(a.status) === status;
    return matchQ && matchS;
  });

  render(filtered);
}

async function loadApps() {
  try {
    const res = await fetch("data/applications.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch applications.json");
    const data = await res.json();
    allApps = Array.isArray(data) ? data : [];
  } catch (err) {
    // Fallback sample if the JSON isn't available (e.g., first run)
    allApps = [
      {
        company: "Example Company",
        industry: "Cybersecurity / SOC",
        role: "SOC Analyst Intern",
        date: "2026-01-03",
        status: "Planned",
        notes: "Replace with your real entries in data/applications.json",
        link: ""
      }
    ];
  }

  applyFilters();
}

searchInput.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);
resetBtn.addEventListener("click", () => {
  searchInput.value = "";
  statusFilter.value = "";
  applyFilters();
});

loadApps();
