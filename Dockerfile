# Stage 1: Build the React frontend
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup the Python backend and serve
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies for psycopg2 and others if needed
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy the rest of the backend code
COPY backend/ ./backend/

# Copy the built frontend from Stage 1
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Expose port 8000
EXPOSE 8000

# Run the FastAPI app
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
