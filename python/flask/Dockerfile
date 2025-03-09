# lightweight Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5050

# Run Flask app
CMD ["python", "app.py"]