import { readFileSync, writeFileSync } from "node:fs";
import { basename, relative } from "node:path";

const [, , inputPath = "jest-results.json", outputPath = "test-results.xml"] =
  process.argv;

const results = JSON.parse(readFileSync(inputPath, "utf8"));

const escapeXml = (value = "") =>
  String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const seconds = (milliseconds = 0) => {
  const value = Number(milliseconds);
  return Number.isFinite(value) ? (Math.max(value, 0) / 1000).toFixed(3) : "0";
};

const normalizePath = (path = "") =>
  path ? relative(process.cwd(), path).replaceAll("\\", "/") || basename(path) : "";

const escapeCommandData = (value = "") =>
  String(value).replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");

const escapeCommandProperty = (value = "") =>
  escapeCommandData(value).replaceAll(":", "%3A").replaceAll(",", "%2C");

const summarizeError = (message = "") =>
  String(message)
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("●")) || "Runtime error";

const testSuites = results.testResults ?? [];
const totalTests = Number(results.numTotalTests ?? 0);
const totalFailures = Number(results.numFailedTests ?? 0);
const totalSkipped =
  Number(results.numPendingTests ?? 0) + Number(results.numTodoTests ?? 0);
const totalErrors = Number(results.numRuntimeErrorTestSuites ?? 0);
const totalTime =
  testSuites.reduce((sum, suite) => {
    if (Number.isFinite(suite.startTime) && Number.isFinite(suite.endTime)) {
      return sum + Math.max(suite.endTime - suite.startTime, 0);
    }
    return sum;
  }, 0) || 0;

const suiteXml = testSuites
  .map((suite) => {
    const assertions = suite.assertionResults ?? [];
    const suiteFailures = assertions.filter((test) => test.status === "failed").length;
    const suiteSkipped = assertions.filter((test) =>
      ["pending", "skipped", "todo"].includes(test.status)
    ).length;
    const suiteErrors = suite.status === "failed" && assertions.length === 0 ? 1 : 0;
    const suiteName = normalizePath(suite.name) || "jest";
    const suiteTime =
      Number.isFinite(suite.startTime) && Number.isFinite(suite.endTime)
        ? suite.endTime - suite.startTime
        : assertions.reduce((sum, test) => sum + Number(test.duration ?? 0), 0);

    const testCases = assertions
      .map((test) => {
        const classname =
          test.ancestorTitles?.length > 0
            ? test.ancestorTitles.join(" > ")
            : suiteName;
        const failureMessages = test.failureMessages ?? [];
        const failureXml =
          test.status === "failed"
            ? `\n      <failure message="${escapeXml(
                failureMessages[0] || test.title || "Test failed"
              )}">${escapeXml(failureMessages.join("\n\n"))}</failure>`
            : "";
        const skippedXml = ["pending", "skipped", "todo"].includes(test.status)
          ? "\n      <skipped />"
          : "";

        return `    <testcase classname="${escapeXml(classname)}" name="${escapeXml(
          test.title
        )}" time="${seconds(test.duration)}">${failureXml}${skippedXml}\n    </testcase>`;
      })
      .join("\n");

    const runtimeError =
      suiteErrors > 0
        ? `    <testcase classname="${escapeXml(suiteName)}" name="runtime error" time="0">\n      <failure message="${escapeXml(
            suite.message || "Runtime error"
          )}">${escapeXml(suite.message || "Runtime error")}</failure>\n    </testcase>`
        : "";

    return `  <testsuite name="${escapeXml(suiteName)}" tests="${
      assertions.length + suiteErrors
    }" failures="${suiteFailures + suiteErrors}" errors="0" skipped="${suiteSkipped}" time="${seconds(
      suiteTime
    )}">\n${[testCases, runtimeError].filter(Boolean).join("\n")}\n  </testsuite>`;
  })
  .join("\n");

const runtimeErrors = testSuites
  .filter((suite) => suite.status === "failed" && (suite.assertionResults ?? []).length === 0)
  .map((suite) => ({
    name: normalizePath(suite.name) || "jest",
    message: suite.message || "Runtime error",
  }));

if (runtimeErrors.length > 0) {
  console.log("\nJest runtime errors:");
  for (const { name, message } of runtimeErrors) {
    console.log(`\n--- ${name} ---`);
    console.log(message);

    if (process.env.GITHUB_ACTIONS === "true") {
      console.log(
        `::error file=${escapeCommandProperty(name)},title=Jest runtime error::${escapeCommandData(
          summarizeError(message)
        )}`
      );
    }
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="jest tests" tests="${totalTests || testSuites.length}" failures="${totalFailures}" errors="${totalErrors}" skipped="${totalSkipped}" time="${seconds(
  totalTime
)}">
${suiteXml}
</testsuites>
`;

writeFileSync(outputPath, xml);
