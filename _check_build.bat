@echo off
cd /d "C:\Users\denni\Documents\BaseballLineup"
call npx tsc --noEmit > _tsc_output.txt 2>&1
echo TSC_EXIT=%ERRORLEVEL% >> _tsc_output.txt
