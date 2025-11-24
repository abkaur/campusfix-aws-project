// CampusFixSubmitIssue - index.js using AWS SDK v3

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

// Region & table name
const REGION = process.env.AWS_REGION || "us-east-1"; // change if your region is different
const TABLE_NAME = process.env.TABLE_NAME || "CampusFixIssues";

const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event));

  try {
    const body = JSON.parse(event.body || "{}");
    const { name, email, location, category, description } = body;

    // Basic validation
    if (!name || !email || !location || !category || !description) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    // Simple unique id (no extra libraries needed)
    const issueId = "ISSUE-" + Date.now();
    const now = new Date().toISOString();

    const item = {
      issueId,
      name,
      email,
      location,
      category,
      description,
      status: "NEW",
      createdAt: now,
      updatedAt: now,
    };

    // Save to DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Issue submitted successfully",
        issueId,
      }),
    };
  } catch (err) {
    console.error("Error in submitIssue:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
