## Project setup instructions

1. Clone the repository
2. Install the dependencies
3. Run the application

### 2. Install the dependencies
* python3 -m venv venv
* source venv/bin/activate
* pip install -r requirements.txt

### 3. Run the application
* venv\Scripts\activate 
* uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload