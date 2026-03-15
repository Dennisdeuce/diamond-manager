@echo off
cd /d "C:\Users\denni\Documents\BaseballLineup"

echo === Ensuring .gitignore is respected ===
git rm -r --cached node_modules 2>nul
git rm -r --cached dist 2>nul
git rm -r --cached .env.local 2>nul

echo === Adding files ===
git add .gitignore
git add package.json tsconfig.json vite.config.ts tailwind.config.ts postcss.config.js
git add index.html vercel.json .env.example
git add public\favicon.svg
git add src\*.tsx src\*.ts src\*.css
git add src\lib\*.ts
git add src\types\*.ts
git add src\contexts\*.tsx
git add src\hooks\*.ts
git add src\services\*.ts
git add src\components\ui\*.tsx
git add src\components\auth\*.tsx
git add src\components\layout\*.tsx
git add src\components\roster\*.tsx
git add src\components\games\*.tsx
git add src\components\lineup\*.tsx
git add src\components\history\*.tsx
git add src\components\settings\*.tsx
git add supabase\migrations\*.sql

echo === Committing ===
git commit -m "feat: Diamond Manager baseball lineup web app"

echo === Pushing ===
git remote remove origin 2>nul
git remote add origin https://github.com/Dennisdeuce/diamond-manager.git
git branch -M main
git push -u origin main --force

echo === Done ===
echo Push exit code: %ERRORLEVEL%
pause
