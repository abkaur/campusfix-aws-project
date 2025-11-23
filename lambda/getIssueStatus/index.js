// lambda/getIssueStatus/index.js

// Later we will fetch real status from DynamoDB or RDS.
// For now, return a dummy status.

exports.handler = async (event) => {
  console.log("Incoming event:", JSON.stringify(event));

  const issueId = event.pathParameters
    ? event.pathParameters.issueId
    : null;

  if (!issueId) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "issueId path parameter is required" }),
    };
  }

  // TODO: look up issueId in DynamoDB/RDS and return real status
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      issueId: issueId,
      status: "IN_PROGRESS",
      updatedAt: new Date().toISOString(),
    }),
  };
};
