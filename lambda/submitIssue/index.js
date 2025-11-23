// lambda/submitIssue/index.js

// In the next phase we will add AWS SDK calls to DynamoDB and S3.
// For now, we simulate by returning a dummy issueId.

exports.handler = async (event) => {
  console.log("Incoming event:", JSON.stringify(event));

  // event.body is a JSON string from API Gateway (POST request)
  const body = JSON.parse(event.body || "{}");

  // Very small validation
  if (!body.description || !body.location || !body.category) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Missing required fields" }),
    };
  }

  // Temporary: generate a fake issueId (later use DynamoDB + uuid)
  const issueId = `ISSUE-${Date.now()}`;

  // TODO: save to DynamoDB + upload file to S3 if needed

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Issue submitted successfully",
      issueId: issueId,
    }),
  };
};
