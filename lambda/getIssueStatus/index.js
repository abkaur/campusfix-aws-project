// CampusFixGetIssueStatus - index.js using AWS SDK v3

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE_NAME = process.env.TABLE_NAME || "CampusFixIssues";

const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

exports.handler = async (event) => {
  console.log("EVENT:", JSON.stringify(event));

  try {
    // Try to read issueId from path parameter: /status/{issueId}
    let issueId = null;

    if (event.pathParameters && event.pathParameters.issueId) {
      issueId = event.pathParameters.issueId;
    }
    // Fallback: also support ?issueId=... just in case
    else if (
      event.queryStringParameters &&
      event.queryStringParameters.issueId
    ) {
      issueId = event.queryStringParameters.issueId;
    }

    if (!issueId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "issueId is required" }),
      };
    }

    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { issueId }, // must match partition key name
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Request not found" }),
      };
    }

    const { status, updatedAt } = result.Item;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        issueId,
        status,
        updatedAt,
      }),
    };
  } catch (err) {
    console.error("Error in getIssueStatus:", err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
