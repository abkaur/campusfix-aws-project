// lambda/submitIssue/index.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

const REGION = process.env.AWS_REGION || "ca-central-1"; // change if needed
const TABLE_NAME = process.env.TABLE_NAME || "CampusFixIssues";

const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    const { name, email, location, category, description } = body;

    if (!name || !email || !location || !category || !description) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    const issueId = uuidv4();
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
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
