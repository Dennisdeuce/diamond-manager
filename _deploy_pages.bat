@echo off
cd /d "C:\Users\denni\Documents\BaseballLineup"

echo === Rebuilding with base path ===
call npx vite build

echo === Committing changes ===
git add -A
git commit -m "fix: HashRouter + base path for GitHub Pages"
git push origin main

echo === Deploying to GitHub Pages ===
call npx gh-pages -d dist

echo === DONE ===
echo.
echo Site live at: https://dennisdeuce.github.io/diamond-manager/
echo.
pause
