# KrishiSaarthi - Project Documentation

## 1️⃣ PROJECT OVERVIEW

### Project Name
**KrishiSaarthi** (Derived from *Krishi* meaning Agriculture and *Saarthi* meaning Charioteer/Guide)

### High-Level Summary
KrishiSaarthi is a "Phygital" (Physical + Digital) agricultural platform designed to bridge the gap between advanced technology and Indian farmers. It serves as a comprehensive ecosystem that combines AI-driven disease detection and business advisory services with a blockchain-based Green Credit Marketplace. The platform empowers farmers to improve crop health, make smart investment decisions, and earn additional income through sustainable farming practices.

### Real-World Problem It Solves
- **Lack of Expertise:** Farmers often struggle to identify crop diseases early, leading to yield loss.
- **Financial Uncertainty:** Poor investment choices in crops or allied businesses often lead to debt.
- **Sustainability Gap:** Sustainable farming practices are encouraged but rarely monetized or transparently rewarded.
- **Market Access:** Farmers lack direct access to corporate buyers for carbon credits.

### Target Users
- **Farmers:** The primary beneficiaries who use the tools for disease detection, advice, and selling green credits.
- **Validators:** Trusted third parties (agronomists, local officials) who verify the farmers' sustainable practices physically and digitally.
- **Buyers:** Corporates or individuals looking to purchase valid green credits to offset their carbon footprint.

### Key Features
- **AI Crop Doctor:** Instant disease diagnosis from leaf photos with treatment suggestions.
- **Business Advisor:** AI chatbot that recommends profitable agricultural businesses based on land, budget, and local conditions.
- **Green Credit Marketplace:** A transparent blockchain platform where farmers trade carbon credits earned via sustainable farming.
- **Role-Based Access:** tailored dashboards for Farmers, Validators, and Buyers.

---

## 2️⃣ CORE CONCEPT & IDEA

### Concept in Simple Terms
Imagine a digital assistant that acts as a doctor, financial advisor, and broker for a farmer.
1.  **Doctor:** The farmer takes a photo of a sick plant, and the app tells them what's wrong and how to fix it.
2.  **Advisor:** The farmer asks, "I have 2 acres and ₹50,000, what should I grow?" and the app gives a detailed business plan.
3.  **Broker:** The farmer grows organic food, a validator checks it, and the farmer gets "Green Credits" which they can sell for cash to companies.

### Evolution of the Idea
The project started as a simple disease detection tool. However, we realized that diagnosing a problem isn't enough; farmers need financial stability and incentives to adopt better practices. Thus, the **Business Advisor** was added to help with financial planning, and the **Green Credit Marketplace** was introduced to gamify and monetize sustainability using Blockchain.

### Why This Approach?
- **AI over Manual Inspection:** Manual inspection is slow and expensive. AI scales instantly to millions of users.
- **Blockchain over Centralized Database:** Blockchain ensures that Green Credits are unique, traceable, and cannot be forged. This builds trust with buyers who want to ensure their money actually supports green practices.
- **Web App over Mobile App:** A PWA (Progressive Web App) model ensures accessibility on low-end devices without requiring large downlods.

---

## 3️⃣ SYSTEM ARCHITECTURE

### Overall System Flow
1.  **User Interface (Frontend):** The user interacts with the React-based web app.
2.  **Authentication:** User logs in via Firebase Auth; their role (Farmer/Validator/Buyer) determines their dashboard.
3.  **AI Services (Backend):**
    - **Disease Detection:** Image is sent to the Flask API $\rightarrow$ Processed by TensorFlow Model $\rightarrow$ Result returned.
    - **Advisory:** Chat messages sent to Flask API $\rightarrow$ Processed by LangChain/LLM $\rightarrow$ Context-aware advice returned.
4.  **Database (Firestore):** Stores user profiles, application history, and non-blockchain metadata.
5.  **Blockchain (Smart Contracts):** Handles the minting, transfer, and verification of Green Tokens using Ethereum/Polygon networks.

### Data Flow Diagram
```mermaid
graph TD
    User[User (Browser)] <-->|HTTPS| Frontend[React Frontend]
    Frontend <-->|Auth| Firebase[Firebase Auth & Firestore]
    Frontend <-->|API Calls| Backend[Python Flask Server]
    Backend <-->|Inference| AI_Models[TensorFlow & LLM]
    Frontend <-->|Web3| Blockchain[Ethereum/Polygon Smart Contracts]
```

---

## 4️⃣ TECH STACK

| Technology | Purpose | Why Chosen? | Alternatives |
| :--- | :--- | :--- | :--- |
| **React (Vite)** | Frontend UI | Component-based, fast updates, excellent ecosystem. | Angular, Vue |
| **Tailwind CSS** | Styling | Rapid development, consistent design system. | Bootstrap, SCSS |
| **Python (Flask)** | Backend API | Essential for running AI/ML models easily. | Django, FastAPI |
| **Firebase** | Auth & DB | Real-time updates, serverless, easy scaling. | AWS, Supabase |
| **TensorFlow** | AI Model | Robust framework for image classification. | PyTorch |
| **Solidity** | Blockchain | Standard for Ethereum Virtual Machine (EVM). | Rust (Solana) |
| **Ethers.js** | Web3 Client | Lightweight library to connect React with Blockchain. | Web3.js |

---

## 5️⃣ FOLDER & FILE STRUCTURE

### Root Directory
- **/Frontend:** Contains the React application source code.
- **/Backend:** Contains the Python Flask server and AI models.
- **firebase.json:** Configuration for Firebase Hosting and rules.
- **README.md:** High-level project summary.

### Frontend Structure (`/Frontend/src`)
```
/src
├── /components      # Reusable UI elements (Buttons, Cards, Layouts)
│   ├── ProtectedRoute.tsx  # Handles role-based access control
│   └── Layout.tsx          # Main page wrapper with Navbar/Sidebar
├── /contexts        # React Contexts for global state
│   ├── AppContext.tsx      # User profile and global app state
│   └── BlockchainContext.tsx # Web3 connection management
├── /pages           # Main view components corresponding to Routes
│   ├── FarmerDashboard.tsx
│   ├── CropDiseaseDetector.tsx
│   └── ...
├── /lib             # Utility libraries (utils, constants)
├── App.tsx          # Main Router configuration
└── main.tsx         # Entry point, mounts React to DOM
```

### Backend Structure (`/Backend`)
```
/Backend
├── app.py           # Main Flask application entry point
├── /services        # Business logic modules
│   ├── /Disease Detector  # ML models and prediction logic
│   └── /Business Advisor  # Chatbot logic
├── /uploads         # Temp storage for processing images
└── requirements.txt # Python dependencies
```

---

## 6️⃣ DETAILED CODE EXPLANATION

### Feature: Disease Detection
**Module:** `Backend/app.py` & `services/detector.py`
- **Logic:**
    1.  Frontend uploads an image to `/api/disease/detect`.
    2.  `app.py` saves the file temporarily.
    3.  Calls `detector_predict()` which pre-processes the image (resizing, normalization).
    4.  Feeds it to the loaded `.h5` deep learning model.
    5.  Returns the class with highest probability + confidence score.
    6.  Fetches treatment info from `crop_disease_data.csv`.

### Feature: Business Advisor Chat
**Module:** `Backend/app.py` & `services/krishi_chatbot.py`
- **Logic:**
    1.  Frontend sends user message + session ID.
    2.  Backend retrieves the `KrishiSaarthiAdvisor` instance for that session.
    3.  The request typically passes through an LLM (Large Language Model) chain or rule-based logic to generate advice tailored to the farmer's profile (land size, budget).

### Feature: Role-Based Routing
**Module:** `Frontend/components/ProtectedRoute.tsx`
- **Logic:** Checks the user's role stored in `AppContext`. If the user matches `allowedRoles` (e.g., 'farmer'), it renders the child component. If not, it redirects to the login or home page.

---

## 7️⃣ DATABASE DESIGN (Firestore)

**Type:** NoSQL Document Store

**Collections:**
1.  `users`
    - `uid` (string): Unique Auth ID
    - `role` (string): 'farmer' | 'validator' | 'buyer'
    - `name`, `email`, `phone`
2.  `projects` (Green Credit Applications)
    - `farmerId`: Reference to user
    - `cropType`: string
    - `status`: 'pending' | 'verified' | 'rejected'
    - `images`: Array of evidence URLs

**Why NoSQL?** The data structure for agricultural projects can vary (different crops have different parameters), making a flexible schema ideal.

---

## 8️⃣ API FLOW

### Backend API (Flask)
| Endpoint | Method | Purpose | request | response |
| :--- | :--- | :--- | :--- | :--- |
| `/api/disease/detect` | `POST` | Detect disease from image | `multipart/form-data` (image) | JSON (disease, cure) |
| `/api/business-advisor/init` | `POST` | Start a chat session | JSON (user profile) | JSON (session_id) |
| `/api/business-advisor/chat` | `POST` | Send message to bot | JSON (msg, session_id) | JSON (reply) |

---

## 9️⃣ SECURITY CONSIDERATIONS

1.  **Authentication:** Strict reliance on Firebase Auth. No custom password handling.
2.  **Role Verification:** Frontend checks are convenience only. **Critical:** Firestore security rules must be set to ensure a 'farmer' cannot read 'validator' data.
3.  **Input Sanitization:** `werkzeug.utils.secure_filename` is used in Python to prevent file upload attacks.
4.  **Environment Variables:** Blockchain keys and Firebase config are stored in `.env` and never committed to Git.

---

## 🔟 PERFORMANCE & SCALABILITY

- **Frontend:** Built with Vite for extremely fast loading. React components are lazy-loaded where possible.
- **Backend:** Flask is lightweight. For scaling, this should be moved to a production-grade WSGI server (like Gunicorn) behind Nginx.
- **AI Models:** Currently loaded in memory. For scale, these should be served via TensorFlow Serving or a dedicated microservice to prevent blocking the main web server.

---

## 1️⃣1️⃣ DEPLOYMENT DETAILS

The project follows a decoupled deployment strategy:

- **Frontend:** Hosted on **Firebase Hosting**.
    - Build: `npm run build`
    - Deploy: `firebase deploy`
    - Why? Fast CDN content delivery globally.

- **Backend:** (Local/Cloud VM)
    - Ideally deployed on a platform like AWS EC2, Google Cloud Run, or Heroku.
    - Requires Python environment and access to model files.

---

## 1️⃣2️⃣ CONFIGURATION & ENV FILES

### Frontend `.env`
Create this file in `/Frontend`:
```env
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

### Backend Configuration
Managed via `app.py` config variables (like `UPLOAD_FOLDER`). Ensure `requirements.txt` is up to date.

---

## 1️⃣3️⃣ HOW TO RUN LOCALLY

### Prerequisites
1.  Node.js installed.
2.  Python 3.8+ installed.
3.  Git installed.

### Step-by-Step

**1. Clone and Setup Frontend:**
```bash
cd Frontend
npm install
# Ensure .env is created as above
npm run dev
```

**2. Setup Backend:**
```bash
cd Backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python app.py
```

**3. Common Errors:**
- *ModuleNotFound:* Run `pip install -r requirements.txt` again.
- *CORS Error:* Ensure `flask_cors` is installed and enabled in `app.py`.

---

## 1️⃣4️⃣ FUTURE IMPROVEMENTS

1.  **Smart Contract Audits:** Before real money usage, contracts need professional auditing.
2.  **Offline Mode:** Enhance PWA capabilities for farmers with poor connectivity.
3.  **Vernacular Voice Support:** Allow farmers to speak in their dialect instead of typing.
4.  **IoT Integration:** Auto-fetch soil data from sensors instead of manual input.

---

## 1️⃣5️⃣ LEARNING OUTCOMES

By working on this project, developers gain skills in:
- **Full Stack Integration:** Connecting React with Python AI services.
- **Web3 Development:** Implementing practical blockchain use-cases beyond cryptocurrency.
- **Applied AI:** Deploying Deep Learning models in a consumer-facing app.
- **System Design:** Architecting a multi-role platform with varying security needs.

---
*This document serves as the internal truth for the KrishiSaarthi project.*
