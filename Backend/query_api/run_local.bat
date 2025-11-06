@echo off
echo Starting ClearChartAI Backend locally on port 8080...
echo.
echo Make sure you've authenticated with: gcloud auth application-default login
echo.
cd /d "%~dp0"
uvicorn main:app --reload --host 127.0.0.1 --port 8080
