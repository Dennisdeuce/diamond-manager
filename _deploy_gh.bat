@echo off
cd /d "C:\Users\denni\Documents\BaseballLineup"

echo === Rebuilding ===
call npx vite build > _deploy_log.txt 2>&1

echo === Deploying to gh-pages ===
call npx gh-pages -d dist >> _deploy_log.txt 2>&1

echo EXIT_CODE=%ERRORLEVEL% >> _deploy_log.txt
