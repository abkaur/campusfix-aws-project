const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Temporary in-memory data
let issues = [
  {
    issueId: "ISSUE-1",
    category: "IT",
    location: "Lab 101",
    description: "Computer not booting",
    status: "NEW",
    updatedAt: new Date().toISOString(),
  },
];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>CampusFix Admin</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background: #2563eb; color: white; }
          form { display: inline-block; }
          select, button { margin-left: 4px; }
        </style>
      </head>
      <body>
        <h1>CampusFix - Admin Dashboard</h1>
        <p>View and update campus service requests.</p>

        <table>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Location</th>
            <th>Description</th>
            <th>Status</th>
            <th>Updated At</th>
            <th>Action</th>
          </tr>
          ${issues
            .map(
              (issue) => `
              <tr>
                <td>${issue.issueId}</td>
                <td>${issue.category}</td>
                <td>${issue.location}</td>
                <td>${issue.description}</td>
                <td>${issue.status}</td>
                <td>${issue.updatedAt}</td>
                <td>
                  <form method="POST" action="/update">
                    <input type="hidden" name="issueId" value="${issue.issueId}" />
                    <select name="status">
                      <option value="NEW">NEW</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                    <button type="submit">Update</button>
                  </form>
                </td>
              </tr>
            `
            )
            .join("")}
        </table>
      </body>
    </html>
  `);
});

app.post("/update", (req, res) => {
  const { issueId, status } = req.body;
  const issue = issues.find((i) => i.issueId === issueId);
  if (issue) {
    issue.status = status;
    issue.updatedAt = new Date().toISOString();
  }
  res.redirect("/");
});

app.get("/api/issues", (req, res) => {
  res.json(issues);
});

app.listen(PORT, () => {
  console.log(`Admin API running on http://localhost:${PORT}`);
});
