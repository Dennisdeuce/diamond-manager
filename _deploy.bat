@echo off
cd /d "C:\Users\denni\Documents\BaseballLineup"

echo === Deploying to Netlify ===
npx netlify-cli deploy --dir=dist --prod --site diamond-manager 2>&1

echo === DONE ===
pause
