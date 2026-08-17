@echo off
title HELIX V11 - Otomatik 7/24 Yukleme Araci
color 0b

echo ===================================================
echo      HELIX V11 GITHUB VE 7/24 HAZIRLIK ARACI
echo ===================================================
echo.

:: 1. Git kontrolu
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] HATA: Git programi bulunamadi.
    pause
    exit
)

:: 2. index.js kontrolu
if not exist index.js (
    echo [!] HATA: index.js bulunamadi!
    pause
    exit
)

:: 3. package.json kontrolu
if not exist package.json (
    echo [+] package.json olusturuluyor...
    call npm init -y >nul
)

:: 4. Procfile olustur
echo web: node index.js > Procfile

:: 5. Git yapilandirmasi ve Commit
echo [+] Git deposu sifirlanip yeniden yapilandiriliyor...
if exist .git rmdir /s /q .git
git init >nul
git config user.name "HELIX Bot" >nul
git config user.email "helixbot@example.com" >nul
git add .
git commit -m "Helix Bot Update Commit" >nul

echo.
echo ===================================================
echo  LUTFEN BIR ISLEM SECIN:
echo  [1] Otomatik Link (helix-bot reposuna direkt yukler)
echo  [2] Manuel Link (Link girmenizi bekler)
echo ===================================================
echo.
set /p SECIM="Seciminiz (1 veya 2): "

if "%SECIM%"=="1" (
    set REPO_URL=https://github.com/kumarbot939/helix-bot.git
    echo.
    echo [+] Otomatik link secildi: %REPO_URL%
    goto YUKLE
)

if "%SECIM%"=="2" (
    echo.
    set /p REPO_URL="Github Repo HTTPS URL: "
    goto LINK_KONTROL
)

echo.
echo [!] Gecersiz secim yapildı! Islem iptal edildi.
pause
exit

:LINK_KONTROL
if "%REPO_URL%"=="https://github.com/kumarbot939/helix-bot.git" (
    goto YUKLE
) else (
    echo.
    echo ===================================================
    echo [!] HATA: Ben bu adrese yukleme yapmam!
    echo     Sadece tanimli helix-bot reposu kabul edilir.
    echo ===================================================
    pause
    exit
)

:YUKLE
echo.
echo [+] Github'a push islemi baslatiliyor...
git branch -M main
git remote add origin %REPO_URL%
git push -u origin main --force

echo.
echo ===================================================
echo [OK] KODLAR BASARIYLA GITHUB'A YUKLENDI!
echo ===================================================
pause