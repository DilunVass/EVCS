FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libffi-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port 8080 (Cloud Run's required port)
EXPOSE 8080

# Command to run the application
# Fixed: main:app (not app.main:app) and port 8080 (not 8000)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]