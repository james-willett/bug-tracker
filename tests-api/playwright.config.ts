import { defineConfig } from "@playwright/test";
export default defineConfig({
  use: {
    // All requests we send go to this API endpoint.
    baseURL:
      process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:8080/api/",
  },
  reporter: [
    ["list"],
    ["junit", { outputFile: "test-results/results.xml" }],
    ["html", { outputFolder: "playwright-report" }],
  ],
});
