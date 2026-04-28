@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d D:\Note
start "BiliNote" /MIN cmd /c "npm run dev"
echo BiliNote started. Press Ctrl+Shift+N to toggle window.
