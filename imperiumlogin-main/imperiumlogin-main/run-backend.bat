@echo off
echo Starting IMPERIUM Local Backend...
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
pause
