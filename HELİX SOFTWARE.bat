@echo off
title HELIX V11 Bot Baslatici
color 0b

echo ===================================================
echo           HELIX V11 BOT BASLATICI
echo ===================================================
echo.

set /p BOT_TOKEN="Lutfen Bot Tokeninizi Giriniz: "

echo.
echo Bot baslatiliyor, lutfen bekleyin...
echo.

node index.js %BOT_TOKEN%

pause