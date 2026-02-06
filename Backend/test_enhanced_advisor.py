"""
API Test for Enhanced Agricultural Decision Intelligence Assistant
Tests the /api/business-advisor/init and /api/business-advisor/chat endpoints
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_enhanced_advisor_api():
    """Test the enhanced advisor via API calls"""
    
    print("\n" + "="*60)
    print("🧪 TESTING AGRICULTURAL DECISION INTELLIGENCE ASSISTANT API")
    print("="*60)
    
    # Step 1: Initialize advisor with complete farmer profile
    print("\n📋 Step 1: Initializing advisor with complete farmer profile...")
    
    init_payload = {
        "name": "Ramesh Kumar",
        "age": 45,
        "role": "farmer",
        "state": "Maharashtra",
        "district": "Pune",
        "village": "Manchar",
        "land_size": 5.0,
        "land_unit": "acres",
        "soil_type": "Black",
        "water_availability": "Borewell",
        "crops_grown": ["Wheat", "Sugarcane"],
        "capital": 200000,
        "market_access": "moderate",
        "skills": ["farming"],
        "risk_level": "low",
        "time_availability": "full-time",
        "experience_years": 20,
        "language": "english"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/business-advisor/init", json=init_payload)
        response.raise_for_status()
        init_data = response.json()
        
        if init_data.get('success'):
            session_id = init_data['session_id']
            print(f"✅ Advisor initialized successfully!")
            print(f"   Session ID: {session_id}")
            print(f"   Recommendations: {len(init_data.get('recommendations', []))} business options")
        else:
            print(f"❌ Initialization failed: {init_data}")
            return
            
    except Exception as e:
        print(f"❌ Error initializing advisor: {e}")
        return
    
    # Step 2: Test context-aware chat
    print("\n" + "-"*60)
    print("💬 Step 2: Testing context-aware chat...")
    print("-"*60)
    
    test_questions = [
        {
            "question": "What crops should I grow next season?",
            "expected": "Should mention Maharashtra/Pune climate, Black soil suitability"
        },
        {
            "question": "What fertilizer should I use for my wheat crop?",
            "expected": "Should NOT ask for soil type (already knows it's Black soil)"
        },
        {
            "question": "How should I manage irrigation for sugarcane?",
            "expected": "Should use Borewell context, not ask about water source"
        }
    ]
    
    for i, test in enumerate(test_questions, 1):
        print(f"\n🔍 Test {i}: {test['question']}")
        print(f"   Expected: {test['expected']}")
        
        chat_payload = {
            "session_id": session_id,
            "message": test['question']
        }
        
        try:
            response = requests.post(f"{BASE_URL}/api/business-advisor/chat", json=chat_payload)
            response.raise_for_status()
            chat_data = response.json()
            
            if chat_data.get('success'):
                answer = chat_data['response']
                print(f"\n   🤖 Response: {answer[:200]}...")
                
                # Check if response asks for known information (it shouldn't)
                forbidden_phrases = [
                    "what is your location",
                    "which state",
                    "what type of soil",
                    "what is your soil type",
                    "water source",
                    "which crops do you grow"
                ]
                
                asks_known_info = any(phrase in answer.lower() for phrase in forbidden_phrases)
                if asks_known_info:
                    print("   ⚠️  WARNING: Response asks for information already provided!")
                else:
                    print("   ✅ Response does NOT ask for known information")
            else:
                print(f"   ❌ Chat failed: {chat_data}")
                
        except Exception as e:
            print(f"   ❌ Error in chat: {e}")
    
    print("\n" + "="*60)
    print("✅ API TESTS COMPLETED")
    print("="*60)
    print("\n📊 MANUAL VERIFICATION CHECKLIST:")
    print("  [ ] Assistant did NOT ask for location/soil/water info")
    print("  [ ] Recommendations are specific to Maharashtra/Pune")
    print("  [ ] Suggestions match Black soil and Borewell water")
    print("  [ ] Responses are practical and actionable")
    print("  [ ] No generic textbook explanations")
    print("\n")

if __name__ == "__main__":
    print("🚀 Starting API tests...")
    print("⚠️  Make sure the backend server is running on http://localhost:5000")
    print("   Run: python app.py")
    
    input("\nPress Enter to continue...")
    test_enhanced_advisor_api()
