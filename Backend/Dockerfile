# Use Python 3.10 slim image for a balance of size and compatibility
FROM python:3.10-slim

# Prevent Python from writing pyc files and allow stdout buffering for logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies required for OpenCV and TensorFlow
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install gunicorn

# Copy the rest of the application
COPY . .

# Expose port 5000
EXPOSE 5000

# Run the application with Gunicorn
# Adjust workers and timeout based on resource availability
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--threads", "8", "--timeout", "120", "app:app"]
