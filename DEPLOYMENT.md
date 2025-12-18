# 🚀 Deployment Guide: How to Run KrishiSaarthi Globally

This guide explains how to take your project from "Localhost" to the "Live Web" so anyone in the world can use it.

## 🛑 The Challenge: "Local" vs "Global"
Your project has three parts, and each needs a different home in the cloud:

1.  **Frontend (React):** 🟢 **Easy.** Can be hosted on Firebase, Vercel, or Netlify.
2.  **Backend Logic (Flask + Disease Model):** 🟡 **Medium.** Needs a Python server (Render, Railway, or AWS).
3.  **The LLM (Ollama):** 🔴 **Hard.** Currently, your code connects to `localhost:11434`. Cloud servers *do not* have Ollama installed by default.

---

## ✅ Step 1: Frontend Deployment (Firebase)

You are already using Firebase, so this is the easiest part.

1.  **Build the Frontend:**
    ```bash
    cd Frontend
    npm run build
    ```

2.  **Deploy to Firebase Hosting:**
    ```bash
    firebase deploy
    ```

3.  **Update Config:**
    Once your backend is live (Step 2), you must update `.env` in the Frontend to point to the *Cloud URL* instead of `http://localhost:5000`.

---

## ✅ Step 2: Backend Deployment (Flask + Disease Model)

We need to package your Python code into a **Docker Container** so it runs on any cloud server.

### 1. Create a `Dockerfile`
Create a file named `Dockerfile` (no extension) inside the `Backend/` folder with this content:

```dockerfile
# Use Python 3.9
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 5000

# Command to run the app using Gunicorn (Production Server)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app", "--timeout", "120"]
```

### 2. Update `requirements.txt`
Add `gunicorn` and `flask-cors` to your `Backend/requirements.txt` if they aren't there.

### 3. Choose a Cloud Provider
*   **Recommended (Easiest):** **Render.com** or **Railway.app**.
    *   Connect your GitHub repo.
    *   Select the `Backend` folder.
    *   They will automatically detect the Dockerfile and build it.
    *   **Note:** The Free Tier might be slow for TensorFlow.

---

## ✅ Step 3: Solving the LLM (Ollama) Issue

This is the most critical part. You cannot easily run Ollama on a free cloud server because LLMs need **8GB+ RAM** and ideally a **GPU**.

### Option A: The "Hackathon" Approach (Switch to Cloud API) - **RECOMMENDED**
Instead of running a local heavy model, switch your code to use a Cloud API like **Google Gemini (Free)** or **OpenAI**.

1.  **Get an API Key** (e.g., from Google AI Studio).
2.  **Modify `krishi_chatbot.py`:**
    Replace `Ollama` with `ChatGoogleGenerativeAI` or `ChatOpenAI`.
    This makes your backend lightweight enough to run on *any* cheap server.

### Option B: The "Self-Hosted" Approach (Keep Ollama)
If you *must* use Ollama:
1.  You need to rent a **GPU Server** (e.g., AWS EC2 `g4dn.xlarge` or Paperspace).
2.  Install Docker and Ollama on that server manually.
3.  Expose Ollama to the internet (or use an SSH tunnel).
4.  Point your Flask Backend environment variable `OLLAMA_BASE_URL` to that remote server IP.

---

## 📝 Summary Checklist

| Component | Local Setup | Global Setup (Recommended) |
| :--- | :--- | :--- |
| **Frontend** | `localhost:5173` | **Firebase Hosting** (`your-app.web.app`) |
| **Backend** | `localhost:5000` | **Render / Railway** (running Docker) |
| **Disease Model** | Local `.h5` file | packaged in **Docker Image** (runs on CPU) |
| **Business LLM** | Local `Ollama` | Switch to **Gemini/OpenAI API** OR Rent GPU Server |

### 🔗 Next Steps for You
1.  Create the `Dockerfile` in `Backend/`.
2.  Decide if you want to pay for a GPU server (for Ollama) or switch to a Cloud API (Gemini/OpenAI).
3.  Push your code to GitHub.
4.  Connect GitHub to Render/Railway.
5.  Enjoy your global app! 🌍
