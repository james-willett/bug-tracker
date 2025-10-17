# ------------------------------
# PowerShell Script: Reset Jenkins
# ------------------------------

# Config: change these paths if needed
$sourceFolder = "C:\Users\Bala\OneDrive\Desktop\CI_CD\Bug_Tracker\bug-tracker\jenkins"
$targetFolder = "C:\CI_CD\bug-tracker\jenkins"   # safe location outside OneDrive

# 1. Stop and remove existing Jenkins containers
Write-Host "Stopping any running Jenkins containers..."
docker compose -f "$sourceFolder\docker-compose.yml" down

# 2. Delete old jenkins_home folder
$jenkinsHome = Join-Path $sourceFolder "jenkins_home"
if (Test-Path $jenkinsHome) {
    Write-Host "Deleting old Jenkins home folder..."
    Remove-Item -Recurse -Force $jenkinsHome
}

# 3. Move Jenkins folder outside OneDrive (if not already)
if ($sourceFolder -like "*OneDrive*") {
    if (!(Test-Path $targetFolder)) {
        Write-Host "Creating target folder..."
        New-Item -ItemType Directory -Force -Path $targetFolder | Out-Null
    }

    Write-Host "Copying Jenkins files to safe location..."
    Copy-Item -Recurse -Force -Path $sourceFolder\* -Destination $targetFolder

    $composeFolder = $targetFolder
} else {
    $composeFolder = $sourceFolder
}

# 4. Start Jenkins fresh
Write-Host "Starting fresh Jenkins container..."
docker compose -f "$composeFolder\docker-compose.yml" up -d --build

# 5. Final instructions
Write-Host ""
Write-Host "✅ Jenkins is starting fresh!"
Write-Host "Open your browser at: http://localhost:9000"
Write-Host "Use this command to see logs: docker logs -f my-jenkins"
