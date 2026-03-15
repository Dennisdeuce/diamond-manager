@echo off
cd /d "C:\Users\denni\Documents\BaseballLineup"

echo === Git Init ===
git init

echo === Git Add ===
git add -A

echo === Git Commit ===
git commit -m "feat: Diamond Manager - baseball lineup web app"

echo === Git Remote ===
git remote add origin https://github.com/Dennisdeuce/diamond-manager.git

echo === Git Push ===
git branch -M main
git push -u origin main

echo === Build ===
npx vite build

echo === DONE ===
echo Build complete. Check dist/ folder.
pause
