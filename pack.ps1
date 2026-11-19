# pack.ps1 - build a distributable zip of JellyTCM.
# Usage:  powershell -NoProfile -ExecutionPolicy Bypass -File pack.ps1
#         powershell -NoProfile -ExecutionPolicy Bypass -File pack.ps1 -OutDir C:\Users\me\Desktop
#
# The version is read from app\index.html, so the zip name always matches the site.
# Output layout matches the older releases: a single top-level "JellyTCM" folder
# containing index.html, README.md and assets\ - just unzip and double-click.
# Default output is this repo folder itself, so there is only one place to look.

param(
  [string]$OutDir = $PSScriptRoot
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$src  = Join-Path $root 'app'

if (-not (Test-Path (Join-Path $src 'index.html'))) {
  throw "app\index.html not found under $root"
}

# --- read version from index.html (first vX.YZ occurrence) ---
$html = Get-Content (Join-Path $src 'index.html') -Raw -Encoding UTF8
if ($html -notmatch 'v\d+\.\d+') { throw 'cannot read version string from app\index.html' }
$ver = $Matches[0]

$out = Join-Path $OutDir ("JellyTCM-{0}.zip" -f $ver)
Write-Host ("version : {0}" -f $ver)
Write-Host ("output  : {0}" -f $out)

# --- stage into a temp folder named JellyTCM ---
$stageRoot = Join-Path $env:TEMP ('jellypack_' + [guid]::NewGuid().ToString('n'))
$stage     = Join-Path $stageRoot 'JellyTCM'
New-Item -ItemType Directory -Path $stage -Force | Out-Null

try {
  Copy-Item -Path (Join-Path $src '*') -Destination $stage -Recurse -Force
  $count = (Get-ChildItem $stage -Recurse -File).Count
  Write-Host ("files   : {0}" -f $count)

  if (Test-Path $out) { Remove-Item $out -Force -Confirm:$false }
  Compress-Archive -Path $stage -DestinationPath $out -CompressionLevel Optimal -Force

  $mb = (Get-Item $out).Length / 1MB
  Write-Host ("zip     : {0:N1} MB" -f $mb)

  # --- sanity check: version inside the zip must match ---
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
