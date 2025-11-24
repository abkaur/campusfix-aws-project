// lambda/getIssueStatus/index.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || "ca-central-1";
const TABLE_NAME = process.env.TABLE_NAME || "CampusFixIssues";

const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

exports.handler = async (event) => {
  try {
    const issueId = event.pathParameters
      ? event.pathParameters.issueId
      : null;

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
        Key: { issueId },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
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
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
