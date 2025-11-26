// admin-dashboard/admin.js
// Point this to your EC2 admin API
const ADMIN_API_BASE = 'http:// 44.200.180.173:3000';

// Helper to get query param from URL (e.g., ?id=ISSUE-123)
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// -------------------- Admin Dashboard (admin.html) --------------------

async function loadIssues() {
  const tableBody = document.querySelector("#issuesTable tbody");
  const emptyMsg = document.getElementById("emptyMessage");
  const errorMsg = document.getElementById("errorMessage");

  // If there is no table, we are not on admin.html
  if (!tableBody) return;

  tableBody.innerHTML = "";
  if (emptyMsg) emptyMsg.classList.add("d-none");
  if (errorMsg) errorMsg.classList.add("d-none");

  try {
    // Call the admin API on EC2
    const res = await fetch(`${ADMIN_API_BASE}/issues`);

    if (!res.ok) {
      throw new Error("Network error");
    }

    const issues = await res.json();

    if (!issues || issues.length === 0) {
      if (emptyMsg) emptyMsg.classList.remove("d-none");
      return;
    }

    issues.forEach((issue) => {
      const tr = document.createElement("tr");

      const statusValue = issue.status || "NEW";
      const statusClass = "status-" + statusValue;

      tr.innerHTML = `
        <td>${issue.issueId}</td>
        <td>${issue.category || ""}</td>
        <td>${issue.location || ""}</td>
        <td>${issue.description || ""}</td>
        <td><span class="status-badge ${statusClass}">${statusValue}</span></td>
        <td>${issue.updatedAt || ""}</td>
        <td>
          <a href="update.html?id=${encodeURIComponent(
            issue.issueId
          )}" class="btn btn-sm btn-outline-primary">Update</a>
        </td>
      `;

      tableBody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error loading issues:", err);
    if (errorMsg) errorMsg.classList.remove("d-none");
  }
}

// -------------------- Update Page (update.html) --------------------

async function initUpdatePage() {
  const issueId = getQueryParam("id");
  const issueInfo = document.getElementById("issueInfo");
  const form = document.getElementById("updateForm");
  const messageDiv = document.getElementById("message");

  // If there is no form, we are not on update.html
  if (!form) return;

  if (!issueId) {
    if (issueInfo) {
      issueInfo.textContent = "Missing issue ID in URL.";
    }
    form.classList.add("d-none");
    return;
  }

  // Load issue details
  try {
    const res = await fetch(
      `${ADMIN_API_BASE}/issues/${encodeURIComponent(issueId)}`
    );
    if (!res.ok) throw new Error("Issue not found");

    const issue = await res.json();
    if (issueInfo) {
      issueInfo.textContent = `Issue ID: ${issue.issueId} | ${
        issue.category || ""
      } at ${issue.location || ""}`;
    }
  } catch (err) {
    console.error(err);
    if (issueInfo) {
      issueInfo.textContent = "Could not load issue.";
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (messageDiv) messageDiv.innerHTML = "";

    const status = document.getElementById("status").value;
    if (!status) return;

    try {
      const res = await fetch(
        `${ADMIN_API_BASE}/issues/${encodeURIComponent(issueId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      if (messageDiv) {
        messageDiv.innerHTML =
          '<div class="alert alert-success">Status updated successfully.</div>';
      }
    } catch (err) {
      console.error(err);
      if (messageDiv) {
        messageDiv.innerHTML =
          '<div class="alert alert-danger">Error updating status.</div>';
      }
    }
  });
}

// -------------------- Init depending on page --------------------
document.addEventListener("DOMContentLoaded", () => {
  loadIssues();
  initUpdatePage();
});
