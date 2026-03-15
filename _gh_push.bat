@echo off
cd /d "C:\Users\denni\Documents\BaseballLineup"

echo === Removing old .git ===
rmdir /s /q .git 2>nul

echo === Fresh init with gh credential helper ===
git init
git config credential.helper "!gh auth git-credential"

echo === Adding source files only ===
git add .gitignore .env.example
git add package.json tsconfig.json vite.config.ts tailwind.config.ts postcss.config.js
git add index.html vercel.json
git add public/favicon.svg
git add src/main.tsx src/App.tsx src/index.css src/vite-env.d.ts
git add src/lib/ src/types/ src/contexts/ src/hooks/ src/services/
git add src/components/
git add supabase/

echo === Commit ===
git commit -m "feat: Diamond Manager - baseball lineup web app"

echo === Push via gh credential helper ===
git remote add origin https://github.com/Dennisdeuce/diamond-manager.git
git branch -M main
git push -u origin main

echo.
echo === RESULT: %ERRORLEVEL% ===
pause
