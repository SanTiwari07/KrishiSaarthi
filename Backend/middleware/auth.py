
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
            print(f"[AUTH] Warning: Firebase credentials not found at {cred_path}. Auth middleware will be disabled.")
            return

        cred = credentials.Certificate(cred_path)
        app = firebase_admin.initialize_app(cred)
        print(f"[AUTH] Service Account: {app.project_id}")
    except ValueError:
        # App already initialized
        pass
    except Exception as e:
        print(f"[AUTH] Error initializing Firebase: {e}")

def require_auth(f):
    """Decorator to require Firebase Auth ID Token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Allow OPTIONS requests (CORS preflight) to pass through without auth
        if request.method == 'OPTIONS':
            return '', 200
        
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Authorization header is missing'}), 401
        
        try:
            # Expected format: "Bearer <token>"
            parts = auth_header.split(" ")
            if len(parts) < 2:
                 return jsonify({'error': 'Invalid Authorization header format. Expected "Bearer <token>"'}), 401
            
            token = parts[1]
            if not token or token == 'undefined' or token == 'null':
                print(f"[AUTH] Error: Missing or invalid token literal ('{token}')")
                return jsonify({'error': 'No token provided or token is "undefined"'}), 401

            # Verifying token
            decoded_token = auth.verify_id_token(token)
            request.user = decoded_token 
            return f(*args, **kwargs)
        except auth.ExpiredIdTokenError:
            print("[AUTH] Error: Token expired")
            return jsonify({'error': 'Token expired'}), 401
        except auth.InvalidIdTokenError as e:
            print(f"[AUTH] Error: Invalid token - {e}")
            return jsonify({'error': f'Invalid token: {str(e)}'}), 401
        except Exception as e:
            print(f"[AUTH] Error (Unexpected): {type(e).__name__}: {e}")
            return jsonify({'error': 'Authentication failed'}), 401
            
    return decorated_function
