// admin-dashboard/admin.js

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

  if (!tableBody) return; // we are not on admin.html

  tableBody.innerHTML = "";
  emptyMsg.classList.add("d-none");
  errorMsg.classList.add("d-none");

  try {
    const res = await fetch("/api/issues");
    if (!res.ok) {
      throw new Error("Network error");
    }

    const issues = await res.json();

    if (!issues || issues.length === 0) {
      emptyMsg.classList.remove("d-none");
      return;
    }

    issues.forEach((issue) => {
      const tr = document.createElement("tr");

      const statusClass = "status-" + (issue.status || "NEW");

      tr.innerHTML = `
        <td>${issue.issueId}</td>
        <td>${issue.category || ""}</td>
        <td>${issue.location || ""}</td>
        <td>${issue.description || ""}</td>
        <td><span class="status-badge ${statusClass}">${issue.status}</span></td>
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
    errorMsg.classList.remove("d-none");
  }
}

// -------------------- Update Page (update.html) --------------------

async function initUpdatePage() {
  const issueId = getQueryParam("id");
  const issueInfo = document.getElementById("issueInfo");
  const form = document.getElementById("updateForm");
  const messageDiv = document.getElementById("message");

  if (!form) return; // not on update.html

  if (!issueId) {
    issueInfo.textContent = "Missing issue ID in URL.";
    form.classList.add("d-none");
    return;
  }

  // Load issue details
  try {
    const res = await fetch(`/api/issues/${encodeURIComponent(issueId)}`);
    if (!res.ok) throw new Error("Issue not found");

    const issue = await res.json();
    issueInfo.textContent = `Issue ID: ${issue.issueId} | ${issue.category} at ${issue.location}`;
  } catch (err) {
    console.error(err);
    issueInfo.textContent = "Could not load issue.";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageDiv.innerHTML = "";

    const status = document.getElementById("status").value;
    if (!status) return;

    try {
      const res = await fetch(`/api/issues/${encodeURIComponent(issueId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Update failed");

      messageDiv.innerHTML =
        '<div class="alert alert-success">Status updated successfully.</div>';
    } catch (err) {
      console.error(err);
      messageDiv.innerHTML =
        '<div class="alert alert-danger">Error updating status.</div>';
    }
  });
}

// -------------------- Init depending on page --------------------
document.addEventListener("DOMContentLoaded", () => {
  loadIssues();
  initUpdatePage();
});
