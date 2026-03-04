# JMeter Results Publishing in Jenkins

## Overview
Multiple approaches to publish and visualize JMeter performance test results in Jenkins.

---

## Approach 1: publishHTML Plugin ✅ (Recommended)

**What it does**: Publishes the JMeter HTML dashboard as an interactive report in Jenkins.

### Configuration:
```groovy
publishHTML(target: [
    reportDir: 'tests-perf/jmeter-report',
    reportFiles: 'index.html',
    reportName: 'JMeter Performance Report',
    keepAll: true,                    // Keep reports from all builds
    alwaysLinkToLastBuild: true       // Quick access to latest report
])
```

### Pros:
- ✅ Rich visual dashboard with graphs
- ✅ Built-in Jenkins plugin (no extra installation)
- ✅ Interactive charts and statistics
- ✅ Historical trend data

### Cons:
- ❌ No automatic pass/fail thresholds
- ❌ Requires HTML report generation (`-e -o` flags)

### Access:
Build page → "JMeter Performance Report" link in sidebar

---

## Approach 2: Archive Artifacts

**What it does**: Stores raw JTL files for download and external analysis.

### Configuration:
```groovy
archiveArtifacts artifacts: 'tests-perf/jmeter-results.jtl',
                 allowEmptyArchive: false,
                 fingerprint: true
```

### Pros:
- ✅ Raw data preservation
- ✅ Can be analyzed with external tools
- ✅ Fingerprinting for tracking changes
- ✅ Downloadable for offline analysis

### Cons:
- ❌ No visualization in Jenkins
- ❌ Requires manual analysis

### Access:
Build page → "Build Artifacts" → Download JTL file

---

## Approach 3: Performance Plugin 🔌 (Advanced)

**What it does**: Provides trend analysis, thresholds, and build status based on performance metrics.

### Installation:
```bash
# Install via Jenkins Plugin Manager
Manage Jenkins → Plugins → Available → "Performance Plugin"
```

### Configuration:
```groovy
perfReport sourceDataFiles: 'tests-perf/jmeter-results.jtl',
           errorFailedThreshold: 5,      // Mark build as FAILED if >5% errors
           errorUnstableThreshold: 2,    // Mark build as UNSTABLE if >2% errors
           errorUnstableResponseTimeThreshold: 'Health Check:500',  // 500ms threshold
           relativeFailedThresholdPositive: 10,  // Fail if 10% slower than previous
           relativeUnstableThresholdPositive: 5  // Unstable if 5% slower
```

### Pros:
- ✅ Automatic pass/fail based on thresholds
- ✅ Performance trend graphs across builds
- ✅ Comparison with previous builds
- ✅ Detailed metrics per request

### Cons:
- ❌ Requires plugin installation
- ❌ More complex configuration
- ❌ May need JTL format adjustments

### Access:
Build page → "Performance Report" link

---

## Approach 4: JUnit Format (For Test Results)

**What it does**: Converts JMeter results to JUnit XML for test result tracking.

### Configuration:
```groovy
steps {
    sh '''
        jmeter -n -t bugtracker-jmeter.jmx -l jmeter-results.jtl -e -o jmeter-report
        
        # Convert JTL to JUnit XML (requires xslt processor)
        xsltproc /path/to/jmeter-results-to-junit.xsl jmeter-results.jtl > jmeter-junit.xml
    '''
}
post {
    always {
        junit 'tests-perf/jmeter-junit.xml'
    }
}
```

### Pros:
- ✅ Integrates with Jenkins test result tracking
- ✅ Shows pass/fail in test trends
- ✅ Email notifications on failures

### Cons:
- ❌ Requires XSLT transformation
- ❌ Loses performance metrics detail
- ❌ Not ideal for performance data

---

## Approach 5: InfluxDB + Grafana (Enterprise)

**What it does**: Real-time metrics streaming to external monitoring system.

### Configuration:
```groovy
steps {
    sh '''
        jmeter -n -t bugtracker-jmeter.jmx \
               -l jmeter-results.jtl \
               -Jjmeter.save.saveservice.output_format=csv \
               -JinfluxdbUrl=http://influxdb:8086 \
               -JinfluxdbToken=mytoken
    '''
}
```

### Pros:
- ✅ Real-time monitoring
- ✅ Advanced visualization with Grafana
- ✅ Long-term trend analysis
- ✅ Alerting capabilities

### Cons:
- ❌ Requires external infrastructure
- ❌ Complex setup
- ❌ Additional maintenance

---

## Recommended Combination

For most projects, use **Approach 1 + 2**:

```groovy
post {
    always {
        // Visual dashboard
        publishHTML(target: [
            reportDir: 'tests-perf/jmeter-report',
            reportFiles: 'index.html',
            reportName: 'JMeter Performance Report',
            keepAll: true,
            alwaysLinkToLastBuild: true
        ])
        
        // Raw data archive
        archiveArtifacts artifacts: 'tests-perf/jmeter-results.jtl',
                         fingerprint: true
    }
}
```

For advanced needs, add **Approach 3** (Performance Plugin) for threshold-based build status.

---

## Comparison Table

| Approach | Visualization | Thresholds | Trends | Setup Complexity | Best For |
|----------|--------------|------------|--------|------------------|----------|
| publishHTML | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐ | Low | Quick visual reports |
| Archive Artifacts | ❌ | ❌ | ❌ | Very Low | Data preservation |
| Performance Plugin | ⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ | Medium | CI/CD gates |
| JUnit Format | ⭐⭐ | ✅ | ⭐⭐⭐ | Medium | Test tracking |
| InfluxDB/Grafana | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ | High | Enterprise monitoring |
