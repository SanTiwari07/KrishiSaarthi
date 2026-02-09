
import os
import firebase_admin
from firebase_admin import credentials, auth
from functools import wraps
from flask import request, jsonify, current_app

def init_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        cred_path = os.getenv('FIREBASE_CREDENTIALS', 'serviceAccountKey.json')
        if not os.path.isabs(cred_path):
            # Resolve relative to backend root if not absolute
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            cred_path = os.path.join(base_dir, cred_path)
            
        if not os.path.exists(cred_path):
            print(f"Warning: Firebase credentials not found at {cred_path}")
            print("   Auth middleware will fail efficiently. Please add serviceAccountKey.json")
            return

        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized")
    except ValueError:
        # App already initialized
        pass
    except Exception as e:
        print(f"Error initializing Firebase: {e}")

def require_auth(f):
    """Decorator to require Firebase Auth ID Token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Allow OPTIONS requests (CORS preflight) to pass through without auth
        # Return empty response - Flask-CORS will add the CORS headers
        if request.method == 'OPTIONS':
            return '', 200
        
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Authorization header is missing'}), 401
        
        try:
            # Expected format: "Bearer <token>"
            token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(token)
            request.user = decoded_token # Attach user info to request
            return f(*args, **kwargs)
        except IndexError:
            return jsonify({'error': 'Invalid Authorization header format. Expected "Bearer <token>"'}), 401
        except auth.ExpiredIdTokenError:
            return jsonify({'error': 'Token expired'}), 401
        except auth.InvalidIdTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            print(f"Auth Error: {e}")
            return jsonify({'error': 'Authentication failed'}), 401
            
    return decorated_function
