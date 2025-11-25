// admin-api/server.js
const express = require('express');
const cors = require('cors');

// AWS SDK v3
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');

const app = express();
const PORT = 3000;

// 🔁 UPDATE THIS to your real table name
const TABLE_NAME = 'CampusFixIssues'; // e.g. whatever your Lambda uses

// Middleware
app.use(cors());
app.use(express.json());

// DynamoDB client (region = your region, you are in us-east-1)
const ddbClient = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(ddbClient);

// ----------------- Routes -----------------

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CampusFix admin API (DynamoDB)' });
});

// GET /issues  → list all issues from DynamoDB
app.get('/issues', async (req, res) => {
  try {
    const cmd = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const result = await docClient.send(cmd);
    const items = result.Items || [];

    // Optional: sort by updatedAt desc if you store it
    items.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

    res.json(items);
  } catch (err) {
    console.error('Error scanning issues:', err);
    res.status(500).json({ message: 'Failed to load issues' });
  }
});

// GET /issues/:id → get a single issue by issueId
app.get('/issues/:id', async (req, res) => {
  const issueId = req.params.id;

  try {
    const cmd = new GetCommand({
      TableName: TABLE_NAME,
      Key: { issueId }, // make sure issueId is your partition key
    });

    const result = await docClient.send(cmd);

    if (!result.Item) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json(result.Item);
  } catch (err) {
    console.error('Error getting issue:', err);
    res.status(500).json({ message: 'Failed to fetch issue' });
  }
});

// PUT /issues/:id → update status in DynamoDB
app.put('/issues/:id', async (req, res) => {
  const issueId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const cmd = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { issueId },
      UpdateExpression: 'SET #s = :s, updatedAt = :u',
      ExpressionAttributeNames: {
        '#s': 'status',
      },
      ExpressionAttributeValues: {
        ':s': status,
        ':u': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(cmd);

    if (!result.Attributes) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json({
      message: 'Status updated',
      issue: result.Attributes,
    });
  } catch (err) {
    console.error('Error updating issue:', err);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// DELETE /issues/:id → delete issue from DynamoDB
app.delete('/issues/:id', async (req, res) => {
  const issueId = req.params.id;

  try {
    const cmd = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { issueId },
      ReturnValues: 'ALL_OLD',
    });

    const result = await docClient.send(cmd);

    if (!result.Attributes) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json({ message: 'Issue deleted' });
  } catch (err) {
    console.error('Error deleting issue:', err);
    res.status(500).json({ message: 'Failed to delete issue' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`CampusFix admin API (DynamoDB) listening on port ${PORT}`);
});
