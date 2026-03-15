@echo off
cd /d "C:\Users\denni\Documents\BaseballLineup"
git add -A
git status
git commit -m "feat: Diamond Manager baseball lineup web app" --allow-empty
git remote remove origin 2>nul
git remote add origin https://github.com/Dennisdeuce/diamond-manager.git
git branch -M main
git push -u origin main
echo.
echo PUSH DONE - exit code: %ERRORLEVEL%
echo.

echo === Now deploying gh-pages ===
call npx gh-pages -d dist
echo.
echo DEPLOY DONE - exit code: %ERRORLEVEL%
echo Live at: https://dennisdeuce.github.io/diamond-manager/
pause
