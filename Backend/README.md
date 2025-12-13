# KrishiSaarthi Backend API

Backend API server that integrates Disease Detector and Business Advisor functionalities.

## Features

- **Disease Detection API**: Upload crop images to detect diseases using ML model
- **Business Advisor API**: AI-powered business advice using LangChain + Ollama
- **Integrated Advice**: Get business recommendations based on disease detection results

## Setup

### Prerequisites

- Python 3.8+
- Ollama installed and running with `llama3.1:8b` model
- TensorFlow/Keras for disease detection model

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Ensure Ollama is running:
```bash
ollama serve
ollama pull llama3.1:8b
```

3. Make sure the disease detection model is available:
   - Model: `Disease Detector/plant_disease_model.h5`
   - CSV Data: `Disease Detector/crop_disease_data.csv`

### Running the Server

```bash
cd Backend
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /api/health
```

### Disease Detection
```
POST /api/disease/detect
Content-Type: multipart/form-data
Body: image (file)

Response:
{
  "success": true,
  "result": {
    "crop": "Tomato",
    "disease": "Early Blight",
    "severity": "medium",
    "confidence": 0.85,
    "treatment": ["...", "..."],
    "pathogen": "..."
  }
}
```

### Initialize Business Advisor
```
POST /api/business-advisor/init
Content-Type: application/json
Body: {
  "name": "Farmer",
  "land_size": 5.0,
  "capital": 100000,
  "market_access": "moderate",
  "skills": ["farming"],
  "risk_level": "low",
  "time_availability": "full-time",
  "experience_years": 0,
  "language": "english"
}

Response:
{
  "success": true,
  "session_id": "uuid",
  "message": "Business advisor initialized successfully"
}
```

### Chat with Business Advisor
```
POST /api/business-advisor/chat
Content-Type: application/json
Body: {
  "session_id": "uuid",
  "message": "What crops should I grow?"
}

Response:
{
  "success": true,
  "response": "AI response text..."
}
```

### Integrated Advice (Disease + Business)
```
POST /api/business-advisor/integrated-advice
Content-Type: application/json
Body: {
  "session_id": "uuid",
  "disease_result": {
    "crop": "Tomato",
    "disease": "Early Blight",
    "severity": "medium",
    "treatment": ["..."]
  }
}

Response:
{
  "success": true,
  "response": "AI advice considering disease context...",
  "disease_context": {
    "crop": "Tomato",
    "disease": "Early Blight",
    "severity": "medium"
  }
}
```

### Delete Session
```
DELETE /api/business-advisor/sessions/<session_id>
```

## Integration Flow

1. User uploads crop image → Disease Detection API
2. Disease result obtained → User clicks "Get Business Advice"
3. Frontend navigates to Business Advisor with disease context
4. Business Advisor initialized → Integrated advice API called
5. AI provides business recommendations considering:
   - Disease impact on yield/income
   - Cost-effective treatment options
   - Alternative crops/diversification
   - Government schemes
   - Long-term planning

## Notes

- Disease detection model path is relative to Backend directory
- Advisor sessions are stored in memory (use Redis/DB for production)
- CORS is enabled for frontend communication
- File uploads are temporarily stored and cleaned up after processing

