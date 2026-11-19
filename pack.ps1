# pack.ps1 - sync the git copy with the local site, then build the distributable zip.
#
# Layout (parent folder = the everyday local copy):
#   D:\software\JellyTCM\index.html
#   D:\software\JellyTCM\assets\
#   D:\software\JellyTCM\JellyTCM-vX.Y.zip
#   D:\software\JellyTCM\JellyTCM-git\   <-- this repo (.git + README + same site files)
#
# Usage:  powershell -NoProfile -ExecutionPolicy Bypass -File pack.ps1
#         powershell -NoProfile -ExecutionPolicy Bypass -File pack.ps1 -OutDir C:\Users\me\Desktop
#
# It copies the local site into this repo first, so the git version never drifts,
# then packs the local site into a zip with a single top-level "JellyTCM" folder.

param(
  [string]$OutDir = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$Repo = $PSScriptRoot
$Site = Split-Path -Parent $Repo

foreach ($p in @((Join-Path $Site 'index.html'), (Join-Path $Site 'assets'))) {
  if (-not (Test-Path $p)) { throw "local site file not found: $p" }
}

# --- version comes from the local site's index.html ---
$html = Get-Content (Join-Path $Site 'index.html') -Raw -Encoding UTF8
if ($html -notmatch 'v\d+\.\d+') { throw 'cannot read version string from index.html' }
$ver = $Matches[0]
$out = Join-Path $OutDir ("JellyTCM-{0}.zip" -f $ver)
Write-Host ("site    : {0}" -f $Site)
Write-Host ("version : {0}" -f $ver)

# --- 1. sync local site -> git copy ---
Copy-Item (Join-Path $Site 'index.html') (Join-Path $Repo 'index.html') -Force
if (Test-Path (Join-Path $Repo 'assets')) { Remove-Item (Join-Path $Repo 'assets') -Recurse -Force -Confirm:$false }
Copy-Item (Join-Path $Site 'assets') (Join-Path $Repo 'assets') -Recurse -Force
Write-Host ("synced  : index.html + assets -> {0}" -f $Repo)

# --- 2. build zip from the local site ---
$stageRoot = Join-Path $env:TEMP ('jellypack_' + [guid]::NewGuid().ToString('n'))
$stage = Join-Path $stageRoot 'JellyTCM'
New-Item -ItemType Directory -Path $stage -Force | Out-Null
try {
  Copy-Item (Join-Path $Site 'index.html') $stage -Force
  Copy-Item (Join-Path $Site 'assets') $stage -Recurse -Force
  $count = (Get-ChildItem $stage -Recurse -File).Count
  Write-Host ("files   : {0}" -f $count)

  if (Test-Path $out) { Remove-Item $out -Force -Confirm:$false }
  Compress-Archive -Path $stage -DestinationPath $out -CompressionLevel Optimal -Force
  Write-Host ("zip     : {0} ({1:N1} MB)" -f $out, ((Get-Item $out).Length / 1MB))

  # --- 3. sanity check: version inside the zip must match ---
  $check = Join-Path $stageRoot 'check'
  Expand-Archive -Path $out -DestinationPath $check -Force
  $inner = Get-Content (Join-Path $check 'JellyTCM\index.html') -Raw -Encoding UTF8
  if ($inner -match 'v\d+\.\d+' -and $Matches[0] -eq $ver) {
    Write-Host ("OK      : inner index.html reports {0}" -f $Matches[0])
  } else {
    Write-Host 'WARN    : inner version mismatch, inspect the zip manually'
  }
}
finally {
  if (Test-Path $stageRoot) { Remove-Item $stageRoot -Recurse -Force -Confirm:$false }
}
