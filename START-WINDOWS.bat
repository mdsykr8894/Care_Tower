@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
 echo Node.js tidak dijumpai. Pasang Node.js 20 atau lebih baru.
 pause
 exit /b 1
)
set /p HOST_PIN=Masukkan PIN presenter (contoh: care12345): 
if "%HOST_PIN%"=="" (
 echo PIN kosong tidak digalakkan. Tutup dan jalankan semula.
 pause
 exit /b 1
)
echo.
echo Server Care Tower sedang bermula...
node server/index.js
pause
