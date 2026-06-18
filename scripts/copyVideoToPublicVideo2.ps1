$src = "video2\Screen Recording 2026-06-11 131319.mp4"
$dstDir = "public\video2"
$dst = "$dstDir\Screen Recording 2026-06-11 131319.mp4"

if (!(Test-Path $dstDir)) {
  New-Item -ItemType Directory -Path $dstDir | Out-Null
}

Copy-Item -Force -LiteralPath $src -Destination $dst
Write-Host "Copied to: $dst"
