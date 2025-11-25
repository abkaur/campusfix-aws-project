const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory mock data (pretend these came from DynamoDB)
let issues = [
  {
    issueId: 'ISSUE-1763997166373',
    name: 'Abhijot Kaur',
    email: 'abhijot@example.com',
    location: 'Library',
    category: 'Facilities',
    description: 'Microwave not working!',
    status: 'NEW',
    updatedAt: new Date().toISOString(),
  },
  {
    issueId: 'ISSUE-1763997114683',
    name: 'Abhijot Kaur',
    email: 'abhijot@example.com',
    location: 'Lab',
    category: 'IT',
    description: 'Projector not working',
    status: 'IN_PROGRESS',
    updatedAt: new Date().toISOString(),
  },
];

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CampusFix admin API' });
});

// GET /issues  → list all issues
app.get('/issues', (req, res) => {
  res.json(issues);
});

// PUT /issues/:id  → update status
app.put('/issues/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const issue = issues.find((i) => i.issueId === id);
  if (!issue) {
    return res.status(404).json({ message: 'Issue not found' });
  }

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  issue.status = status;
  issue.updatedAt = new Date().toISOString();

  res.json({ message: 'Status updated', issue });
});

app.listen(PORT, () => {
  console.log(`CampusFix admin API listening on port ${PORT}`);
});
