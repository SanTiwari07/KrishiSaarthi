"""
KrishiSaarthi Backend API Server
Integrates Disease Detector and Business Advisor
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
from werkzeug.utils import secure_filename
import pandas as pd
from pathlib import Path

# Add project modules to path
BUSINESS_ADVISOR_DIR = Path(__file__).resolve().parent / 'services' / 'Business Advisor'
DISEASE_DETECTOR_DIR = Path(__file__).resolve().parent / 'services' / 'Disease Detector'

for path in (BUSINESS_ADVISOR_DIR, DISEASE_DETECTOR_DIR):
    path_str = str(path)
    if path_str not in sys.path:
        sys.path.append(path_str)

from krishi_chatbot import KrishiSaarthiAdvisor, FarmerProfile
from detector import predict as detector_predict

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Resolve important paths relative to this file so things work no matter
# where you run the server from.
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

# Configuration
UPLOAD_FOLDER = str(BASE_DIR / 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load disease data CSV using project-root-relative paths
MODEL_FILE = DISEASE_DETECTOR_DIR / 'plant_disease_model.h5'
CSV_PATH = DISEASE_DETECTOR_DIR / 'crop_disease_data.csv'

disease_data = None

def load_disease_data():
    """Load disease information CSV for treatment details."""
    global disease_data
    try:
        if CSV_PATH.exists():
            disease_data = pd.read_csv(str(CSV_PATH))
            print("✅ Disease data CSV loaded successfully")
        else:
            print(f"⚠️  CSV file not found at {CSV_PATH}")
    except Exception as e:
        print(f"❌ Error loading disease data: {e}")

# Load disease data on startup
load_disease_data()

# Store active advisor sessions (in production, use Redis or database)
advisor_sessions = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_disease_info(crop_name, disease_name):
    """Get disease information from CSV"""
    if disease_data is None:
        return None
    
    try:
        # Search for matching crop and disease
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
    """Predict disease from image using shared detector module."""
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

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': MODEL_FILE.exists(),
        'data_loaded': disease_data is not None
    })

@app.route('/api/disease/detect', methods=['POST'])
def detect_disease():
    """Disease detection endpoint"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: PNG, JPG, JPEG, GIF, BMP'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Predict disease
        prediction = predict_disease(filepath)
        
        # Get detailed disease information
        disease_info = get_disease_info(prediction['crop'], prediction['disease'])
        
        # Prepare treatment steps
        treatment = []
        if disease_info:
            if disease_info['home_remedy'] and disease_info['home_remedy'] != 'N/A':
                treatment.append(disease_info['home_remedy'])
            if disease_info['chemical_recommendation'] and disease_info['chemical_recommendation'] != 'N/A':
                treatment.append(f"Chemical: {disease_info['chemical_recommendation']}")
        else:
            # Default treatment if not found in CSV
            treatment = [
                'Remove affected leaves immediately',
                'Apply appropriate fungicide',
                'Ensure proper spacing between plants',
                'Water at the base, avoid wetting leaves',
                'Apply organic neem oil spray'
            ]
        
        # Clean up uploaded file
        try:
            os.remove(filepath)
        except:
            pass
        
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
        return jsonify({'error': str(e)}), 500

@app.route('/api/business-advisor/init', methods=['POST'])
def init_advisor():
    """Initialize business advisor session"""
    try:
        data = request.json
        
        # Create farmer profile
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
            risk_preference=data.get('risk_preference')
        )
        
        # Create advisor instance
        advisor = KrishiSaarthiAdvisor(profile)
        
        # Generate session ID
        import uuid
        session_id = str(uuid.uuid4())
        
        # Store session
        advisor_sessions[session_id] = advisor

        # Generate recommendations
        recommendations = advisor.generate_recommendations()
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'recommendations': recommendations,
            'message': 'Business advisor initialized successfully'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/business-advisor/chat', methods=['POST'])
def chat_advisor():
    """Chat with business advisor"""
    try:
        data = request.json
        session_id = data.get('session_id')
        message = data.get('message')
        
        if not session_id or not message:
            return jsonify({'error': 'session_id and message are required'}), 400
        
        if session_id not in advisor_sessions:
            return jsonify({'error': 'Invalid session_id. Please initialize advisor first.'}), 404
        
        advisor = advisor_sessions[session_id]
        response = advisor.chat(message)
        
        return jsonify({
            'success': True,
            'response': response
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/business-advisor/integrated-advice', methods=['POST'])
def integrated_advice():
    """Get business advice integrated with disease detection results"""
    try:
        data = request.json
        session_id = data.get('session_id')
        disease_result = data.get('disease_result')  # From disease detection
        
        if not session_id:
            return jsonify({'error': 'session_id is required'}), 400
        
        if session_id not in advisor_sessions:
            return jsonify({'error': 'Invalid session_id. Please initialize advisor first.'}), 404
        
        if not disease_result:
            return jsonify({'error': 'disease_result is required'}), 400
        
        advisor = advisor_sessions[session_id]
        
        # Create context-aware message
        crop = disease_result.get('crop', 'Unknown')
        disease = disease_result.get('disease', 'Unknown')
        severity = disease_result.get('severity', 'medium')
        
        context_message = f"""I have detected {disease} disease in my {crop} crop with {severity} severity. 
        The treatment recommendations are: {', '.join(disease_result.get('treatment', []))}.
        
        Please provide business advice on:
        1. How this disease might affect my crop yield and income
        2. Cost-effective treatment options considering my budget
        3. Alternative crops or diversification strategies if this disease is severe
        4. Government schemes or support available for crop disease management
        5. Long-term business planning considering disease risks"""
        
        response = advisor.chat(context_message)
        
        return jsonify({
            'success': True,
            'response': response,
            'disease_context': {
                'crop': crop,
                'disease': disease,
                'severity': severity
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/business-advisor/sessions/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    """Delete advisor session"""
    if session_id in advisor_sessions:
        del advisor_sessions[session_id]
        return jsonify({'success': True, 'message': 'Session deleted'})
    return jsonify({'error': 'Session not found'}), 404

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🌾 KRISHISAARTHI BACKEND API SERVER")
    print("="*60)
    print("\nStarting server on http://localhost:5000")
    print("Endpoints:")
    print("  POST /api/disease/detect - Detect crop disease")
    print("  POST /api/business-advisor/init - Initialize advisor")
    print("  POST /api/business-advisor/chat - Chat with advisor")
    print("  POST /api/business-advisor/integrated-advice - Get integrated advice")
    print("\n" + "="*60 + "\n")
    
    app.run(debug=True, port=5000, host='0.0.0.0')

