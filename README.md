# KrishiSaarthi - Digital Farming Partner

KrishiSaarthi is a comprehensive platform empowering Indian farmers with AI-driven crop disease detection, business advisory services, and a blockchain-based green credit marketplace.

## Project Structure

- **frontend/**: The main React application (Vite + Tailwind CSS).
- **backend/services/**: Python-based AI services (`Business Advisor`, `Disease Detector`).
- **firebase.json**: Firebase hosting configuration.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Firebase (Auth & Firestore), Ethers.js
- **Backend Services**: Python, TensorFlow, LangChain, Ollama (for local LLM)
- **Database**: Firebase Firestore
- **Blockchain**: Ethereum/Polygon (Simulated or Testnet)

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Ollama (for chatbot features)

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup (Python Services)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run specific scripts as needed (e.g., `python services/Disease Detector/detector.py`).

## Deployment
The frontend is configured for Firebase Hosting.
```bash
npm run build
firebase deploy
```
