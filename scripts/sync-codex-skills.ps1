param(
    [string]$Source = (Join-Path $PSScriptRoot '..\skills'),
    [string]$Destination = $(if ($env:CODEX_HOME) {
        Join-Path $env:CODEX_HOME 'skills'
    } else {
        Join-Path $HOME '.codex\skills'
    })
)

$sourcePath = (Resolve-Path $Source).Path

if (-not (Test-Path $sourcePath)) {
    throw "Skills source folder not found: $Source"
}

if (-not (Test-Path $Destination)) {
    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
}

$skillDirs = Get-ChildItem -Path $sourcePath -Directory

foreach ($skillDir in $skillDirs) {
    $targetPath = Join-Path $Destination $skillDir.Name
    if (Test-Path $targetPath) {
        Remove-Item -Path $targetPath -Recurse -Force
    }
    Copy-Item -Path $skillDir.FullName -Destination $targetPath -Recurse -Force
    Write-Host "Synced skill: $($skillDir.Name) -> $targetPath"
}

Write-Host "Skill sync complete."
