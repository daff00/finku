[CmdletBinding()]
param(
    [string]$BackupDirectory = (Join-Path $PSScriptRoot "..\backups")
)

$ErrorActionPreference = "Stop"
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backupDirectory = [System.IO.Path]::GetFullPath($BackupDirectory)

$keep = 7
if ($env:FINKU_BACKUP_KEEP) {
    if (-not [int]::TryParse($env:FINKU_BACKUP_KEEP, [ref]$keep) -or $keep -lt 1) {
        throw "FINKU_BACKUP_KEEP must be a positive integer"
    }
}

New-Item -ItemType Directory -Force -Path $backupDirectory | Out-Null
$timestamp = [DateTime]::UtcNow.ToString("yyyyMMddTHHmmssZ")
$containerPath = "/tmp/finku-$timestamp.db"
$backupPath = Join-Path $backupDirectory "finku-$timestamp.db"
$temporaryPath = "$backupPath.tmp"

if ((Test-Path $backupPath) -or (Test-Path $temporaryPath)) {
    throw "Backup already exists for timestamp $timestamp"
}

docker compose --project-directory $repositoryRoot exec -T backend `
    python -m app.core.sqlite_backup `
    --source /data/finku.db `
    --destination $containerPath
if ($LASTEXITCODE -ne 0) {
    throw "SQLite online backup failed with exit code $LASTEXITCODE"
}

docker compose --project-directory $repositoryRoot cp "backend:$containerPath" $temporaryPath
if ($LASTEXITCODE -ne 0) {
    throw "Copying the SQLite backup to the host failed with exit code $LASTEXITCODE"
}
Move-Item -LiteralPath $temporaryPath -Destination $backupPath

docker compose --project-directory $repositoryRoot exec -T backend rm -- $containerPath
if ($LASTEXITCODE -ne 0) {
    throw "Removing the temporary container backup failed with exit code $LASTEXITCODE"
}

$oldBackups = Get-ChildItem -LiteralPath $backupDirectory -File -Filter "finku-*.db" |
    Sort-Object Name -Descending |
    Select-Object -Skip $keep
foreach ($oldBackup in $oldBackups) {
    Remove-Item -LiteralPath $oldBackup.FullName -Force
}

Write-Output "Backup created: $backupPath"
