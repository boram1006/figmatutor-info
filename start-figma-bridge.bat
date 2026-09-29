@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js를 찾을 수 없습니다.
  echo Node.js 설치 또는 PATH 설정을 확인하세요.
  echo.
  pause
  exit /b 1
)

echo Design Flow Harness localhost bridge를 시작합니다.
echo 종료하려면 이 창에서 Ctrl+C를 누르세요.
echo.
npm run figma:bridge

echo.
echo Bridge 서버가 종료되었습니다.
pause
