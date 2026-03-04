# JMeter Performance Tests

This directory contains JMeter test plan for Bug Tracker API performance testing.

## Prerequisites

Install JMeter:
- **Windows**: `winget install Apache.JMeter` or download from https://jmeter.apache.org/
- **macOS**: `brew install jmeter`
- **Linux**: Download from https://jmeter.apache.org/download_jmeter.cgi

## Test Plan Overview

The `bugtracker-jmeter.jmx` file replicates the k6 test with:
- **Duration**: 30 seconds
- **Virtual Users**: 1
- **Tests**:
  1. Health Check (GET /api/health)
  2. Create Bug (POST /api/bugs)
  3. 5-second delay between iterations

## Running Tests

### GUI Mode (for development/debugging)
```bash
jmeter -t bugtracker-jmeter.jmx
```

### CLI Mode (for CI/CD)
```bash
jmeter -n -t bugtracker-jmeter.jmx -l results.jtl -e -o report
```

Parameters:
- `-n`: Non-GUI mode
- `-t`: Test plan file
- `-l`: Results log file
- `-e`: Generate HTML report
- `-o`: Output folder for HTML report

### View Results
After CLI execution, open `report/index.html` in a browser.

## Test Configuration

Edit the `.jmx` file to modify:
- **Virtual Users**: Change `ThreadGroup.num_threads` (line 17)
- **Duration**: Change `ThreadGroup.duration` (line 19)
- **Server**: Change `HTTPSampler.domain` and `HTTPSampler.port`

## Comparison: k6 vs JMeter

| Feature | k6 | JMeter |
|---------|-----|--------|
| File Format | JavaScript | XML (.jmx) |
| Execution | CLI only | GUI + CLI |
| Scripting | JavaScript | GUI-based + Groovy |
| Reports | HTML + JSON | HTML + CSV + JTL |
| CI/CD | Excellent | Good |

## Jenkins Integration

The JMeter tests are integrated into the Jenkins pipeline:

### Option 1: Main Jenkinsfile (Parallel with K6)
The main `jenkins/Jenkinsfile` runs both K6 and JMeter tests in parallel:
- Stage: "Performance Tests" → "JMeter Performance Tests"
- Docker image: `justb4/jmeter:5.6.3`
- Generates HTML report accessible in Jenkins

### Option 2: Standalone JMeter Pipeline
Use `jenkins/Jenkinsfile.jmeter` for JMeter-only tests:
```bash
# In Jenkins, create a new pipeline job pointing to:
jenkins/Jenkinsfile.jmeter
```

This pipeline:
1. Launches the application with Docker Compose
2. Waits for the API to be ready
3. Runs JMeter tests
4. Publishes HTML report
5. Cleans up containers

### Viewing Results in Jenkins
After pipeline execution:
1. Go to the build page
2. Click "JMeter Performance Report" in the sidebar
3. View detailed metrics, graphs, and statistics
