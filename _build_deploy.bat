@echo off
cd /d "C:\Users\denni\Documents\BaseballLineup"

echo === Building ===
call npx vite build > _build_log.txt 2>&1
echo BUILD_EXIT=%ERRORLEVEL% >> _build_log.txt

echo === Deploying to gh-pages ===
call npx gh-pages -d dist >> _build_log.txt 2>&1
echo DEPLOY_EXIT=%ERRORLEVEL% >> _build_log.txt

echo === Done ===
