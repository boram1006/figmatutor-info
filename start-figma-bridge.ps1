$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "[ERROR] Node.js를 찾을 수 없습니다." -ForegroundColor Red
  Write-Host "Node.js 설치 또는 PATH 설정을 확인하세요."
  Read-Host "Enter를 누르면 종료합니다"
  exit 1
}

Write-Host "Design Flow Harness localhost bridge를 시작합니다."
Write-Host "종료하려면 이 창에서 Ctrl+C를 누르세요."
Write-Host ""
npm run figma:bridge
