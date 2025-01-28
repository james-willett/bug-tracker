import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10, // 10 virtual users
  duration: "30s", // Run for 30 seconds
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests should be below 500ms
    http_req_failed: ["rate<0.01"], // Less than 1% of requests should fail
  },
};

export default function () {
  // Create a bug
  const createBugPayload = JSON.stringify({
    title: `Test Bug ${Date.now()}`,
    description: "This is a test bug created by k6",
    priority: "Medium",
  });

  const createResponse = http.post(
    "http://backend:8080/api/bugs",
    createBugPayload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  check(createResponse, {
    "bug created successfully": (r) => r.status === 200,
  });

  const bugId = createResponse.json("id");

  // Get bug details
  const getBugResponse = http.get(`http://backend:8080/api/bugs/${bugId}`);
  check(getBugResponse, {
    "bug retrieved successfully": (r) => r.status === 200,
  });

  // Add a comment
  const commentPayload = JSON.stringify({
    author: "K6 Tester",
    content: `Performance test comment ${Date.now()}`,
  });

  const commentResponse = http.post(
    `http://backend:8080/api/bugs/${bugId}/comments`,
    commentPayload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  check(commentResponse, {
    "comment added successfully": (r) => r.status === 200,
  });

  // Get all bugs (list view)
  const listResponse = http.get("http://backend:8080/api/bugs");
  check(listResponse, {
    "bug list retrieved successfully": (r) => r.status === 200,
  });

  sleep(1); // Wait 1 second between iterations
}
