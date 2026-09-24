@echo off
title Dry Fruits & Organic Store
echo ===================================================
echo   Starting Dry Fruits & Organic Products Store
echo ===================================================
echo.
echo Installing dependencies if needed...
call npm install
echo.
echo Starting Backend & Frontend...
start cmd /k "npm run server"
start cmd /k "npm run dev"
echo.
echo Opening Website in your default browser...
timeout /t 3 >nul
start http://localhost:5173
echo.
echo Both Servers are running!
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause
