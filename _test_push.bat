@echo off
cd /d "C:\Users\denni\Documents\BaseballLineup"

rmdir /s /q .git 2>nul
git init > _push_log.txt 2>&1
git config credential.helper "!gh auth git-credential" >> _push_log.txt 2>&1

git add .gitignore package.json tsconfig.json vite.config.ts tailwind.config.ts postcss.config.js index.html vercel.json .env.example >> _push_log.txt 2>&1
git add public/favicon.svg >> _push_log.txt 2>&1
git add src/ >> _push_log.txt 2>&1
git add supabase/ >> _push_log.txt 2>&1
git commit -m "feat: Diamond Manager" >> _push_log.txt 2>&1

git remote add origin https://github.com/Dennisdeuce/diamond-manager.git >> _push_log.txt 2>&1
git branch -M main >> _push_log.txt 2>&1
git push -u origin main >> _push_log.txt 2>&1

echo EXIT_CODE=%ERRORLEVEL% >> _push_log.txt
