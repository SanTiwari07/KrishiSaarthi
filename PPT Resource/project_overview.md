# KrishiSaarthi (कृषीसारथी): Project Overview

**KrishiSaarthi** is a "Phygital" (Physical + Digital) ecosystem designed to revolutionize Indian agriculture by bridging the gap between advanced technology and ground-level farming.

---

## Mission & Vision
To empower farmers with **AI-driven expertise** and **Blockchain-backed financial incentives**, transforming traditional farming into a sustainable, profitable, and data-informed business.

---

## Core Features

### 1. AI Crop Doctor (Disease Detection)
- **Instant Diagnosis:** Farmers upload photos of infected leaves.
- **AI Analysis:** A Deep Learning model (MobileNetV2/ResNet) identifies diseases in real-time.
- **Actionable Advice:** Provides treatment plans, pesticide recommendations, and home remedies.
- **Multilingual Support:** Interface available in English, Hindi, and Marathi.

### 2. Business Advisor (Financial Planning)
- **Smart Recommendations:** Suggests allied businesses (e.g., Beekeeping, Mushroom Farming) based on land size and budget.
- **ROI Analysis:** Calculates potential profits and setup costs using AI.
- **Interactive Chat:** A LangChain-powered assistant to guide farmers through implementation.

### 3. Green Credit Marketplace (Blockchain)
- **Verified Sustainability:** Farmers earn "Green Credits" (ERC-20 tokens) for organic farming or water conservation.
- **Transparency:** All credits are minted and traded on the Polygon/Ethereum blockchain.
- **Direct Monetization:** Corporates buy credits directly from farmers to offset carbon footprints.

### 4. Waste to Value
- **Residue Processing:** Guides farmers on turning crop waste (like banana stems or rice straw) into value-added products (fibers, bio-gas).
- **Eco-Processing:** Promotes circular economy practices at the farm level.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Framer Motion |
| **Backend AI** | Python (Flask), TensorFlow, LangChain, Ollama (Local LLM) |
| **Blockchain** | Solidity, Hardhat, Ethers.js, MetaMask |
| **Database/Auth** | Firebase Firestore & Authentication |

---

## Ecosystem Roles

- **Farmers:** The primary users accessing AI tools and earning through sustainable practices.
- **Validators:** Trusted agronomists/officials who verify sustainable claims on-site before credit minting.
- **Buyers:** Sustainable-focused corporates and individuals purchasing verified Green Credits.

---

## System Architecture

1. **Physical Layer:** Farmers practice sustainable agriculture and take crop photos.
2. **AI Layer:** Flask-based services process images and provide conversational business advice.
3. **Trust Layer:** Blockchain ensures data integrity and prevents double-counting of carbon credits.
4. **Cloud Layer:** Firebase handles real-time sync, user roles, and secure data storage.

---
*Built for the prosperity of the Indian Farmer.*
