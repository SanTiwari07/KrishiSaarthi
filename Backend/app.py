
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_talisman import Talisman
from dotenv import load_dotenv
import os
import sys
from pathlib import Path
from werkzeug.utils import secure_filename
import pandas as pd
from middleware.auth import init_firebase, require_auth

# Load environment variables
load_dotenv()
init_firebase()

app = Flask(__name__)

# CORS Configuration - Must be set BEFORE Talisman
allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')
CORS(app, resources={r"/api/*": {
    "origins": allowed_origins,
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True
}})

# Security Headers - Disabled in development to avoid CORS conflicts
# TODO: Re-enable Talisman in production with proper CORS configuration
# Talisman(app, 
#     force_https=False,
#     content_security_policy=None,
#     content_security_policy_nonce_in=['script-src']
# )

# Configuration
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR)) # Ensure backend is in path
UPLOAD_FOLDER = str(BASE_DIR / 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# --- Disease Detector Setup ---
DISEASE_DETECTOR_DIR = Path(__file__).resolve().parent / 'services' / 'Disease Detector'
if str(DISEASE_DETECTOR_DIR) not in sys.path:
    sys.path.append(str(DISEASE_DETECTOR_DIR))

from detector import predict as detector_predict
MODEL_FILE = DISEASE_DETECTOR_DIR / 'plant_disease_model.h5'
CSV_PATH = DISEASE_DETECTOR_DIR / 'crop_disease_data.csv'

disease_data = None
def load_disease_data():
    global disease_data
    try:
        if CSV_PATH.exists():
            disease_data = pd.read_csv(str(CSV_PATH))
            print("Disease data CSV loaded successfully")
        else:
            print(f"Warning: CSV file not found at {CSV_PATH}")
    except Exception as e:
        print(f"Error loading disease data: {e}")
load_disease_data()

# --- Business Advisor Setup ---
BUSINESS_ADVISOR_DIR = Path(__file__).resolve().parent / 'services' / 'Business Advisor'
if str(BUSINESS_ADVISOR_DIR) not in sys.path:
    sys.path.append(str(BUSINESS_ADVISOR_DIR))

from krishi_chatbot import KrishiSaarthiAdvisor, FarmerProfile
advisor_sessions = {}

# --- Waste To Value Setup ---
WASTE_TO_VALUE_DIR = Path(__file__).resolve().parent / 'services' / 'WasteToValue' / 'src'
if str(WASTE_TO_VALUE_DIR) not in sys.path:
    sys.path.append(str(WASTE_TO_VALUE_DIR))

from waste_service import WasteToValueEngine
waste_engine = None
try:
    print("Initializing Waste-to-Value Engine...")
    waste_engine = WasteToValueEngine()
    print("Waste-to-Value Engine initialized successfully")
except Exception as e:
    print(f"Warning: Waste-to-Value Engine failed to initialize: {e}")
    print("   The /api/waste-to-value endpoints will return errors until Ollama is available.")
    import traceback
    traceback.print_exc()

# --- Utilities ---
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_disease_info(crop_name, disease_name):
    if disease_data is None: return None
    try:
        match = disease_data[
            (disease_data['Crop Name'].str.lower() == crop_name.lower()) &
            (disease_data['Crop Disease'].str.lower() == disease_name.lower())
        ]
        if not match.empty:
            row = match.iloc[0]
            return {
                'crop': row['Crop Name'],
                'disease': row['Crop Disease'],
                'pathogen': row['Pathogen'],
                'home_remedy': row['Home Remedy'],
                'chemical_recommendation': row['Chemical Recommendation']
            }
    except Exception as e:
        print(f"Error getting disease info: {e}")
    return None

def predict_disease(image_path):
    try:
        return detector_predict(image_path)
    except Exception as e:
        print(f"Error in prediction: {e}")
        return {
            'crop': 'Unknown',
            'disease': f'Error during detection: {e}',
            'confidence': 0.0,
            'severity': 'low'
        }

@app.route('/api/health')
def health_check():
    return jsonify({'status': 'healthy'})

# --- Disease Detector Routes ---
@app.route('/api/disease/detect', methods=['POST', 'OPTIONS'])
@require_auth
def detect_disease():
    try:
        print("=== Disease Detection Request Received ===")
        if 'image' not in request.files:
            print("Error: No image file in request")
            return jsonify({'error': 'No image file provided'}), 400
        file = request.files['image']
        if file.filename == '':
            print("Error: Empty filename")
            return jsonify({'error': 'No file selected'}), 400
        if not allowed_file(file.filename):
            print(f"Error: Invalid file type: {file.filename}")
            return jsonify({'error': 'Invalid file type'}), 400
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        print(f"Saving file to: {filepath}")
        file.save(filepath)
        
        print("Calling predict_disease...")
        prediction = predict_disease(filepath)
        print(f"Prediction result: {prediction}")
        
        disease_info = get_disease_info(prediction['crop'], prediction['disease'])
        
        treatment = []
        if disease_info:
            if disease_info['home_remedy'] and disease_info['home_remedy'] != 'N/A':
                treatment.append(disease_info['home_remedy'])
            if disease_info['chemical_recommendation'] and disease_info['chemical_recommendation'] != 'N/A':
                treatment.append(f"Chemical: {disease_info['chemical_recommendation']}")
        else:
            treatment = ['Remove affected leaves', 'Apply fungicide']
            
        try: os.remove(filepath)
        except: pass
        
        print("Sending successful response")
        return jsonify({
            'success': True,
            'result': {
                'crop': prediction['crop'],
                'disease': prediction['disease'],
                'severity': prediction['severity'],
                'confidence': prediction['confidence'],
                'treatment': treatment,
                'pathogen': disease_info['pathogen'] if disease_info else None
            }
        })
    except Exception as e:
        print(f"ERROR in detect_disease: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# --- Business Advisor Routes ---
@app.route('/api/business-advisor/init', methods=['POST', 'OPTIONS'])
@require_auth
def init_advisor():
    try:
        print("\n" + "="*60)
        print("BUSINESS ADVISOR INIT REQUEST")
        print("="*60)
        data = request.json
        print(f"Farmer Name: {data.get('name', 'Farmer')}")
        print(f"Location: {data.get('state')}, {data.get('district')}, {data.get('village')}")
        print(f"Land: {data.get('land_size')} {data.get('land_unit', 'acres')}")
        print(f"Capital: ₹{float(data.get('capital', 100000)):,.0f}")
        print(f"Crops: {data.get('crops_grown', [])}")
        
        profile = FarmerProfile(
            name=data.get('name', 'Farmer'),
            land_size=float(data.get('land_size', 5.0)),
            capital=float(data.get('capital', 100000)),
            market_access=data.get('market_access', 'moderate'),
            skills=data.get('skills', []),
            risk_level=data.get('risk_level', 'low'),
            time_availability=data.get('time_availability', 'full-time'),
            experience_years=int(data.get('experience_years', 0)),
            language=data.get('language', 'english'),
            selling_preference=data.get('selling_preference'),
            recovery_timeline=data.get('recovery_timeline'),
            loss_tolerance=data.get('loss_tolerance'),
            risk_preference=data.get('risk_preference'),
            age=data.get('age'),
            role=data.get('role', 'farmer'),
            state=data.get('state'),
            district=data.get('district'),
            village=data.get('village'),
            soil_type=data.get('soil_type'),
            water_availability=data.get('water_availability'),
            crops_grown=data.get('crops_grown', []),
            land_unit=data.get('land_unit', 'acres')
        )
        
        print("Initializing KrishiSaarthi Advisor...")
        advisor = KrishiSaarthiAdvisor(profile)
        
        import uuid
        session_id = str(uuid.uuid4())
        advisor_sessions[session_id] = advisor
        print(f"Session Created: {session_id}")
        print(f"Active Sessions: {len(advisor_sessions)}")
        
        print("Generating recommendations...")
        recommendations = advisor.generate_recommendations()
        print(f"Init Complete - Returning {len(recommendations)} recommendations")
        print("="*60 + "\n")
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'recommendations': recommendations,
            'message': 'Business advisor initialized successfully'
        })
    except Exception as e:
        print(f"Error in init_advisor: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/business-advisor/chat', methods=['POST', 'OPTIONS'])
@require_auth
def chat_advisor():
    try:
        print("\n" + "="*60)
        print("BUSINESS ADVISOR CHAT REQUEST")
        print("="*60)
        data = request.json
        session_id = data.get('session_id')
        message = data.get('message')
        
        print(f"Session ID: {session_id}")
        print(f"User Message: {message}")
        
        if not session_id or not message:
            print("Missing session_id or message")
            return jsonify({'error': 'session_id and message are required'}), 400
        if session_id not in advisor_sessions:
            print(f"Invalid session_id: {session_id}")
            print(f"Available sessions: {list(advisor_sessions.keys())}")
            return jsonify({'error': 'Invalid session_id'}), 404
        
        advisor = advisor_sessions[session_id]
        print("Forwarding to chatbot...")
        response = advisor.chat(message)
        print(f"Chat Complete - Response length: {len(response)} chars")
        print("="*60 + "\n")
        
        return jsonify({'success': True, 'response': response})
    except Exception as e:
        print(f"Error in chat_advisor: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/business-advisor/integrated-advice', methods=['POST', 'OPTIONS'])
@require_auth
def integrated_advice():
    try:
        print("\n" + "="*60)
        print("INTEGRATED DISEASE ADVICE REQUEST")
        print("="*60)
        data = request.json
        session_id = data.get('session_id')
        disease_result = data.get('disease_result')
        
        print(f"Session ID: {session_id}")
        print(f"Disease Result: {disease_result}")
        
        if not session_id: 
            print("Missing session_id")
            return jsonify({'error': 'session_id is required'}), 400
        if session_id not in advisor_sessions: 
            print(f"Invalid session_id: {session_id}")
            return jsonify({'error': 'Invalid session_id'}), 404
        if not disease_result: 
            print("Missing disease_result")
            return jsonify({'error': 'disease_result is required'}), 400
        
        advisor = advisor_sessions[session_id]
        crop = disease_result.get('crop', 'Unknown')
        disease = disease_result.get('disease', 'Unknown')
        severity = disease_result.get('severity', 'medium')
        
        context_message = f"I have detected {disease} disease in my {crop} crop with {severity} severity."
        print(f"Generated Context: {context_message}")
        print("Forwarding to chatbot...")
        
        response = advisor.chat(context_message)
        print(f"Integrated Advice Complete")
        print("="*60 + "\n")
        
        return jsonify({
            'success': True,
            'response': response,
            'disease_context': {'crop': crop, 'disease': disease, 'severity': severity}
        })
    except Exception as e:
        print(f"Error in integrated_advice: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# --- Waste To Value Routes ---
@app.route('/api/waste-to-value/analyze', methods=['POST', 'OPTIONS'])
@require_auth
def analyze_waste():
    try:
        print("\n" + "="*60)
        print("WASTE-TO-VALUE ANALYZE REQUEST")
        print("="*60)
        data = request.json
        crop = data.get('crop')
        language = data.get('language', 'English')
        print(f"Crop: {crop}, Language: {language}")
        
        if not crop:
            print("Missing crop name")
            return jsonify({'error': 'Crop name is required'}), 400
        
        if waste_engine is None:
            print("Waste-to-Value Engine not initialized")
            return jsonify({'error': 'Waste-to-Value service is currently unavailable. Please check if Ollama is running.'}), 503
        
        print("Forwarding to WasteToValueEngine...")
        result = waste_engine.analyze_waste(crop, language)
        print(f"Analysis Complete")
        print("="*60 + "\n")
        
        return jsonify({
            'success': True,
            'result': result
        })
    except Exception as e:
        print(f"Server Error in analyze_waste: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/waste-to-value/chat', methods=['POST', 'OPTIONS'])
@require_auth
def chat_waste_api():
    try:
        print("\n" + "="*60)
        print("WASTE-TO-VALUE CHAT REQUEST")
        print("="*60)
        data = request.json
        context = data.get('context')
        question = data.get('question')
        language = data.get('language', 'English')
        
        print(f"Question: {question}, Language: {language}")
        print(f"Context Keys: {list(context.keys()) if context else 'None'}")
        
        if not context or not question:
            print("Missing context or question")
            return jsonify({'error': 'Context and question are required'}), 400
        
        if waste_engine is None:
            print("Waste-to-Value Engine not initialized")
            return jsonify({'error': 'Waste-to-Value service is currently unavailable. Please check if Ollama is running.'}), 503
        
        print("Forwarding to WasteToValueEngine...")
        response = waste_engine.chat_waste(context, question, language)
        print(f"Chat Complete")
        print("="*60 + "\n")
        
        return jsonify({
            'success': True,
            'response': response
        })
    except Exception as e:
        print(f"Chat Server Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting server with ALL components...")
    print("\n=== Registered Routes ===")
    for rule in app.url_map.iter_rules():
        print(f"{rule.endpoint}: {rule.rule} {list(rule.methods)}")
    print("=========================\n")
    app.run(port=5000)

