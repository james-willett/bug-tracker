# JMeter Test Setup Guide

## How JMeter Tests Work in This Repo

### Test Files
1. **bugtracker-jmeter.jmx** - Basic continuous load test (30 seconds)
2. **bugtracker-bulk-test.jmx** - NEW: Create 100 bugs + list them

---

## Understanding the JMX File Structure

### 1. Test Plan
```xml
<TestPlan testname="Bug Tracker Bulk Test">
```
- Root element containing all test configuration

### 2. Thread Group (Virtual Users)
```xml
<ThreadGroup testname="Create 100 Bugs">
  <stringProp name="ThreadGroup.num_threads">10</stringProp>      <!-- 10 concurrent users -->
  <stringProp name="ThreadGroup.ramp_time">5</stringProp>         <!-- Start all in 5 seconds -->
  <intProp name="LoopController.loops">10</intProp>               <!-- Each user loops 10 times -->
</ThreadGroup>
```
**Result**: 10 users × 10 loops = 100 bug creations

### 3. HTTP Sampler (Request)
```xml
<HTTPSamplerProxy testname="Create Bug">
  <stringProp name="HTTPSampler.domain">localhost</stringProp>
  <stringProp name="HTTPSampler.port">8080</stringProp>
  <stringProp name="HTTPSampler.path">/api/bugs</stringProp>
  <stringProp name="HTTPSampler.method">POST</stringProp>
```

### 4. Dynamic Data with JMeter Functions
```json
{
  "title": "Bulk Test Bug ${__threadNum}-${__counter(TRUE,)}",
  "priority": "${__Random(Low,Medium,High,)}"
}
```
- `${__threadNum}` - Thread/user number (1-10)
- `${__counter(TRUE,)}` - Global counter (1-100)
- `${__Random(...)}` - Random value from list

### 5. Listeners (Reports)
- **Summary Report** - Min, Max, Mean, Percentiles
- **Aggregate Report** - Statistical summary table
- **Graph Results** - Visual time-series chart
- **View Results in Table** - Detailed per-request data

---

## New Test: Create 100 Bugs + List Them

### Test Structure

**Thread Group 1: Create 100 Bugs**
- 10 concurrent users
- Each creates 10 bugs
- Total: 100 bugs created

**Thread Group 2: List All Bugs**
- 1 user
- Runs after all bugs created
- Fetches all bugs via GET /api/bugs

### Reports Generated

#### 1. Summary Report (CSV)
Location: `bulk-test-results.csv`

| Label | # Samples | Average | Min | Max | Std. Dev. | Error % | Throughput |
|-------|-----------|---------|-----|-----|-----------|---------|------------|
| Create Bug | 100 | 45ms | 12ms | 234ms | 32ms | 0.00% | 15.2/sec |
| Get All Bugs | 1 | 156ms | 156ms | 156ms | 0ms | 0.00% | 1.0/sec |

#### 2. HTML Dashboard Report
Generated with `-e -o` flags:
- **Statistics Table** - Min, Max, Mean, Percentiles (90%, 95%, 99%)
- **Response Time Graph** - Time-series visualization
- **Response Time Percentiles** - Distribution chart
- **Throughput Over Time** - Requests/second graph

---

## Running the Tests

### Option 1: GUI Mode (Development)
```bash
cd tests-perf
jmeter -t bugtracker-bulk-test.jmx
```
- Opens JMeter GUI
- Click green "Start" button
- View real-time results in listeners

### Option 2: CLI Mode (CI/CD)
```bash
cd tests-perf
jmeter -n \
  -t bugtracker-bulk-test.jmx \
  -l bulk-results.jtl \
  -e -o bulk-report
```

**Flags:**
- `-n` - Non-GUI mode
- `-t` - Test plan file
- `-l` - Results log file (JTL)
- `-e` - Generate HTML report
- `-o` - Output folder for HTML report

### Option 3: Jenkins Pipeline
```groovy
stage('Bulk Performance Test') {
    steps {
        dir('tests-perf') {
            sh '''
                rm -rf bulk-report bulk-results.jtl
                jmeter -n \
                  -t bugtracker-bulk-test.jmx \
                  -l bulk-results.jtl \
                  -e -o bulk-report
            '''
        }
    }
    post {
        always {
            publishHTML(target: [
                reportDir: 'tests-perf/bulk-report',
                reportFiles: 'index.html',
                reportName: 'Bulk Test Report'
            ])
        }
    }
}
```

---

## Viewing Results

### HTML Dashboard Report
Open `bulk-report/index.html` in browser:

**Statistics Table:**
```
Request Name    | Samples | Min  | Max  | Mean | 90%ile | 95%ile | 99%ile
----------------|---------|------|------|------|--------|--------|--------
Create Bug      | 100     | 12ms | 234ms| 45ms | 78ms   | 112ms  | 198ms
Get All Bugs    | 1       | 156ms| 156ms| 156ms| 156ms  | 156ms  | 156ms
```

**Response Time Graph:**
```
Response Time (ms)
250 |                    *
200 |              *  *  
150 |        *  *        *
100 |     *           *
 50 |  *  
  0 |___________________
    0  20  40  60  80 100
         Request #
```

### CSV Results
Open `bulk-test-results.csv`:
```csv
timeStamp,elapsed,label,responseCode,success,bytes,sentBytes,grpThreads,allThreads,Latency
1707656400000,45,Create Bug,201,true,256,128,10,10,42
1707656400050,38,Create Bug,201,true,256,128,10,10,35
...
```

---

## Customizing the Test

### Change Number of Bugs
Edit Thread Group parameters:
```xml
<stringProp name="ThreadGroup.num_threads">20</stringProp>  <!-- 20 users -->
<intProp name="LoopController.loops">5</intProp>           <!-- 5 loops each -->
```
Result: 20 × 5 = 100 bugs

### Add More Requests
Add new HTTPSamplerProxy after "Create Bug":
```xml
<HTTPSamplerProxy testname="Update Bug">
  <stringProp name="HTTPSampler.path">/api/bugs/1</stringProp>
  <stringProp name="HTTPSampler.method">PUT</stringProp>
  ...
</HTTPSamplerProxy>
```

### Change Server
```xml
<stringProp name="HTTPSampler.domain">production.example.com</stringProp>
<stringProp name="HTTPSampler.port">443</stringProp>
<stringProp name="HTTPSampler.protocol">https</stringProp>
```

---

## Key Metrics Explained

| Metric | Description | Good Value |
|--------|-------------|------------|
| **Min** | Fastest response time | < 50ms |
| **Max** | Slowest response time | < 500ms |
| **Mean** | Average response time | < 200ms |
| **90%ile** | 90% of requests faster than | < 300ms |
| **Error %** | Failed requests percentage | 0% |
| **Throughput** | Requests per second | > 10/sec |

---

## Troubleshooting

### Test doesn't create 100 bugs
- Check loop count: `num_threads × loops = 100`
- Verify API is running: `curl http://localhost:8080/api/health`

### No HTML report generated
- Ensure output folder doesn't exist: `rm -rf bulk-report`
- Check JMeter version: `jmeter --version` (need 5.0+)

### Results show errors
- Check response assertions
- View error details in "View Results Tree" listener
- Check API logs for failures
