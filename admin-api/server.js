// admin-api/server.js
// Simple Admin API for CampusFix (uses DynamoDB, no RDS)

const express = require("express");
const cors = require("cors");

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");

const app = express();
const PORT = process.env.PORT || 3000;

// -------- DynamoDB config --------
const REGION = process.env.AWS_REGION || "us-east-1";          // change if needed
const TABLE_NAME = process.env.TABLE_NAME || "CampusFixIssues";

const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

// -------- Middleware --------
app.use(cors());
app.use(express.json());

// Serve the admin dashboard static files
app.use(express.static("admin-dashboard"));

// -------- API routes --------

// GET /api/issues  - list all issues
app.get("/api/issues", async (req, res) => {
  try {
    const data = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    // Optional: sort by createdAt descending
    const items = (data.Items || []).sort((a, b) =>
      (b.createdAt || "").localeCompare(a.createdAt || "")
    );

    res.json(items);
  } catch (err) {
    console.error("Error getting issues:", err);
    res.status(500).json({ message: "Error getting issues" });
  }
});

// GET /api/issues/:id - get single issue
app.get("/api/issues/:id", async (req, res) => {
  const issueId = req.params.id;

  try {
    const data = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { issueId },
      })
    );

    if (!data.Item) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json(data.Item);
  } catch (err) {
    console.error("Error getting issue:", err);
    res.status(500).json({ message: "Error getting issue" });
  }
});

// PUT /api/issues/:id  - update status
app.put("/api/issues/:id", async (req, res) => {
  const issueId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const now = new Date().toISOString();

    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { issueId },
        UpdateExpression: "set #s = :s, updatedAt = :u",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: {
          ":s": status,
          ":u": now,
        },
        ReturnValues: "ALL_NEW",
      })
    );

    res.json({ message: "Status updated", issueId, status });
  } catch (err) {
    console.error("Error updating issue:", err);
    res.status(500).json({ message: "Error updating issue" });
  }
});

// -------- Start server --------
app.listen(PORT, () => {
  console.log(`CampusFix admin API listening on port ${PORT}`);
});
