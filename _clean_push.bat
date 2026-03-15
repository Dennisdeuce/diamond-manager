@echo off
cd /d "C:\Users\denni\Documents\BaseballLineup"

echo === Removing old .git (fresh start) ===
rmdir /s /q .git

echo === Fresh git init ===
git init

echo === Adding only source files (NOT node_modules) ===
git add .gitignore
git add package.json package-lock.json tsconfig.json vite.config.ts tailwind.config.ts postcss.config.js
git add index.html vercel.json .env.example
git add public
git add src
git add supabase

echo === Status ===
git status --short

echo === Commit ===
git commit -m "feat: Diamond Manager - baseball lineup web app"

echo === Push ===
git remote add origin https://github.com/Dennisdeuce/diamond-manager.git
git branch -M main
git push -u origin main --force

echo.
echo === PUSH COMPLETE (exit: %ERRORLEVEL%) ===
pause
