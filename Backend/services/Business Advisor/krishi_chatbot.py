"""
KrishiSaarthi Business Advisor Chatbot
AI-powered business advisor for Indian farmers using LangChain + Ollama
"""

import os
from typing import Optional, List

from langchain_community.llms import Ollama
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from pydantic import BaseModel
import json
import re

# ============================================
# BUSINESS OPTIONS (STRICT LIST)
# ============================================

BUSINESS_OPTIONS = [
    {"id": "1", "title": "FLOWER PLANTATION (GERBERA)"},
    {"id": "2", "title": "PACKAGED DRINKING WATER BUSINESS"},
    {"id": "3", "title": "AMUL FRANCHISE BUSINESS"},
    {"id": "4", "title": "SPIRULINA FARMING (ALGAE)"},
    {"id": "5", "title": "DAIRY FARMING (6–8 COW UNIT)"},
    {"id": "6", "title": "GOAT MILK FARMING (20–25 MILCH GOATS UNIT)"},
    {"id": "7", "title": "MUSHROOM FARMING (OYSTER)"},
    {"id": "8", "title": "POULTRY FARMING (BROILER)"},
    {"id": "9", "title": "VERMICOMPOST PRODUCTION"},
    {"id": "10", "title": "PLANT NURSERY"},
    {"id": "11", "title": "COW DUNG ORGANIC MANURE & BIO-INPUTS"},
    {"id": "12", "title": "COW DUNG PRODUCTS (DHOOP, DIYAS)"},
    {"id": "13", "title": "LEAF PLATE (DONA–PATTAL) MANUFACTURING"},
    {"id": "14", "title": "AGRI-INPUT TRADING"},
    {"id": "15", "title": "INLAND FISH FARMING (POND-BASED)"}
]

# ============================================
# GLOBAL CONFIGURATION
# ============================================

DEFAULT_OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
DEFAULT_OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

force_cpu = os.getenv("OLLAMA_FORCE_CPU", "1").lower() not in {"0", "false"}
if force_cpu and "OLLAMA_NUM_GPU" not in os.environ:
    # Force Ollama to run the model on CPU to avoid CUDA dependency on machines without GPUs
    os.environ["OLLAMA_NUM_GPU"] = "0"


# ============================================
# FARMER PROFILE MODEL
# ============================================

class FarmerProfile(BaseModel):
    """Structured farmer profile data"""
    name: str
    land_size: float  # in acres
    capital: float  # in rupees
    market_access: str  # good/moderate/poor
    skills: List[str]  # farming, dairy, business, solar, etc.
    risk_level: str  # low/medium/high
    time_availability: str  # full-time/part-time
    experience_years: Optional[int] = 0
    language: str = "english"  # english/hindi/hinglish
    selling_preference: Optional[str] = None
    recovery_timeline: Optional[str] = None
    loss_tolerance: Optional[str] = None
    risk_preference: Optional[str] = None
    
    # New fields for Agricultural Decision Intelligence
    age: Optional[int] = None
    role: str = "farmer"
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    soil_type: Optional[str] = None
    water_availability: Optional[str] = None
    crops_grown: Optional[List[str]] = None
    land_unit: str = "acres"
    
    def to_context(self) -> str:
        """Convert profile to natural language context for AI (Agricultural Decision Intelligence format)"""
        # Format crops list
        crops_list = ""
        if self.crops_grown and len(self.crops_grown) > 0:
            crops_list = "\n".join([f"- {crop}" for crop in self.crops_grown])
        else:
            crops_list = "- Not specified"
        
        context = f"""
────────────────────────────────
KNOWN FARMER FACTS (VERIFIED — DO NOT ASK AGAIN)

Farmer Profile:
- Age: {self.age or 'Not specified'}
- Role: {self.role}

Location:
- State: {self.state or 'Not specified'}
- District: {self.district or 'Not specified'}
- Village: {self.village or 'Not specified'}

Farm Details:
- Land Size: {self.land_size} {self.land_unit}
- Soil Type: {self.soil_type or 'Not specified'}
- Water Availability: {self.water_availability or 'Not specified'}

Crops Grown:
{crops_list}

Business Context:
- Available Capital: ₹{self.capital:,.0f}
- Market Access: {self.market_access}
- Risk Tolerance: {self.risk_level}
- Time Availability: {self.time_availability}
- Years of Experience: {self.experience_years}
────────────────────────────────
"""
        return context


# ============================================
# SYSTEM PROMPTS (MULTILINGUAL)
# ============================================

SYSTEM_PROMPTS = {
    "english": """You are an Agricultural Decision Intelligence Assistant designed to provide
high-accuracy, personalized guidance to farmers.

All farmer information is provided dynamically from a verified database.
This database context is the single source of truth.
You MUST rely on it and MUST NOT ask again for any data already present.

RULES YOU MUST FOLLOW:

1. Do NOT ask the farmer again for any information listed under
   "KNOWN FARMER FACTS". These details are complete and verified.

2. Always tailor your recommendations strictly to:
   - The provided location
   - The provided soil type
   - The provided water availability
   - The crops listed above

3. Do NOT suggest crops, practices, inputs, or methods that are unsuitable
   for the farmer's location, soil, or water conditions.

4. Ask a follow-up question ONLY IF ALL of the following are true:
   a) The required information is NOT present in the Known Farmer Facts
   b) The missing information would significantly change the recommendation
   c) The question can be answered in one short line

5. If information is missing but non-critical:
   - Make a reasonable regional assumption silently
   - Clearly mention the assumption in the response

6. Avoid generic or textbook explanations.
   Provide practical, region-specific, and actionable guidance.

7. Do NOT hallucinate data, statistics, prices, schemes, or scientific claims.
   If unsure, clearly state the uncertainty instead of guessing.

8. Maintain a professional, respectful, farmer-friendly tone.

9. Your objective is to maximize relevance and accuracy while minimizing
   unnecessary questions and repetition.

Respond in ENGLISH.""",

    "hindi": """आप एक कृषि निर्णय बुद्धिमत्ता सहायक हैं जो किसानों को उच्च-सटीकता,
व्यक्तिगत मार्गदर्शन प्रदान करने के लिए डिज़ाइन किए गए हैं।

सभी किसान जानकारी एक सत्यापित डेटाबेस से गतिशील रूप से प्रदान की जाती है।
यह डेटाबेस संदर्भ सत्य का एकमात्र स्रोत है।
आपको इस पर भरोसा करना चाहिए और पहले से मौजूद किसी भी डेटा के लिए फिर से नहीं पूछना चाहिए।

नियम जिनका आपको पालन करना चाहिए:

1. "ज्ञात किसान तथ्य" के तहत सूचीबद्ध किसी भी जानकारी के लिए किसान से फिर से न पूछें।
   ये विवरण पूर्ण और सत्यापित हैं।

2. हमेशा अपनी सिफारिशों को सख्ती से अनुकूलित करें:
   - प्रदान किए गए स्थान के लिए
   - प्रदान की गई मिट्टी के प्रकार के लिए
   - प्रदान की गई पानी की उपलब्धता के लिए
   - ऊपर सूचीबद्ध फसलों के लिए

3. ऐसी फसलों, प्रथाओं, इनपुट या विधियों का सुझाव न दें जो किसान के स्थान,
   मिट्टी या पानी की स्थिति के लिए अनुपयुक्त हैं।

4. केवल तभी अनुवर्ती प्रश्न पूछें जब निम्नलिखित सभी सत्य हों:
   a) आवश्यक जानकारी ज्ञात किसान तथ्यों में मौजूद नहीं है
   b) लापता जानकारी सिफारिश को महत्वपूर्ण रूप से बदल देगी
   c) प्रश्न का उत्तर एक छोटी पंक्ति में दिया जा सकता है

5. यदि जानकारी गायब है लेकिन गैर-महत्वपूर्ण है:
   - चुपचाप एक उचित क्षेत्रीय धारणा बनाएं
   - प्रतिक्रिया में धारणा का स्पष्ट रूप से उल्लेख करें

6. सामान्य या पाठ्यपुस्तक स्पष्टीकरण से बचें।
   व्यावहारिक, क्षेत्र-विशिष्ट और कार्रवाई योग्य मार्गदर्शन प्रदान करें।

7. डेटा, आंकड़े, कीमतें, योजनाएं या वैज्ञानिक दावों को मनगढ़ंत न करें।
   यदि अनिश्चित हैं, तो अनुमान लगाने के बजाय अनिश्चितता को स्पष्ट रूप से बताएं।

8. एक पेशेवर, सम्मानजनक, किसान-अनुकूल स्वर बनाए रखें।

9. आपका उद्देश्य प्रासंगिकता और सटीकता को अधिकतम करना है जबकि
   अनावश्यक प्रश्नों और पुनरावृत्ति को कम करना है।

हिंदी में जवाब दें।""",

    "hinglish": """Aap ek Agricultural Decision Intelligence Assistant hain jo farmers ko
high-accuracy, personalized guidance provide karne ke liye design kiye gaye hain.

Sabhi farmer information ek verified database se dynamically provide ki jaati hai.
Yeh database context truth ka single source hai.
Aapko iss par rely karna chahiye aur pehle se present kisi bhi data ke liye dobara nahi poochna chahiye.

RULES jinhe aapko follow karna hai:

1. "KNOWN FARMER FACTS" ke under listed kisi bhi information ke liye farmer se dobara mat poochiye.
   Ye details complete aur verified hain.

2. Hamesha apni recommendations ko strictly tailor karein:
   - Provided location ke liye
   - Provided soil type ke liye
   - Provided water availability ke liye
   - Upar listed crops ke liye

3. Aisi crops, practices, inputs ya methods suggest mat kariye jo farmer ke location,
   soil ya water conditions ke liye unsuitable hain.

4. Follow-up question tabhi poochiye jab ye SABHI true hon:
   a) Required information Known Farmer Facts mein present nahi hai
   b) Missing information recommendation ko significantly change kar degi
   c) Question ka answer ek short line mein diya ja sakta hai

5. Agar information missing hai lekin non-critical hai:
   - Chupchap ek reasonable regional assumption banaiye
   - Response mein assumption ko clearly mention kariye

6. Generic ya textbook explanations se bachiye.
   Practical, region-specific aur actionable guidance provide kariye.

7. Data, statistics, prices, schemes ya scientific claims ko hallucinate mat kariye.
   Agar unsure hain, to guessing ke bajaye uncertainty ko clearly state kariye.

8. Ek professional, respectful, farmer-friendly tone maintain kariye.

9. Aapka objective relevance aur accuracy ko maximize karna hai jabki
   unnecessary questions aur repetition ko minimize karna hai.

Hinglish (Hindi-English mix) mein respond kariye."""
}


# ============================================
# CHATBOT CLASS
# ============================================

class KrishiSaarthiAdvisor:
    """Main chatbot class with memory and profile awareness"""
    
    def __init__(self, farmer_profile: FarmerProfile):
        self.profile = farmer_profile
        self.llm = None
        self.conversation = None
        self.memory = None
        self._initialize_llm()
        self._initialize_conversation()
    
    def _initialize_llm(self):
        """Initialize Ollama LLM"""
        try:
            self.llm = Ollama(
                model=DEFAULT_OLLAMA_MODEL,
                temperature=0.7,  # Balanced creativity
                num_ctx=4096,  # Context window
                num_predict=1500,  # Max output tokens (prevent JSON truncation)
                base_url=DEFAULT_OLLAMA_BASE_URL,
            )
            print("✅ Ollama LLM initialized successfully")
        except Exception as e:
            print(f"❌ Error initializing Ollama: {e}")
            print(
                "Make sure Ollama is running, the model is pulled,"
                " and set OLLAMA_FORCE_CPU=0 if you want to try GPU mode."
            )
            raise
    
    def _initialize_conversation(self):
        """Initialize conversation chain with memory"""
        # Create memory to store chat history
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=False
        )
        
        # Get system prompt based on language
        system_prompt = SYSTEM_PROMPTS.get(
            self.profile.language.lower(), 
            SYSTEM_PROMPTS["english"]
        )
        
        # Create custom prompt template with farmer profile
        template = f"""{system_prompt}

{self.profile.to_context()}

Previous conversation:
{{chat_history}}

Farmer: {{input}}
KrishiSaarthi AI:"""
        
        prompt = PromptTemplate(
            input_variables=["chat_history", "input"],
            template=template
        )
        
        # Create conversation chain
        self.conversation = ConversationChain(
            llm=self.llm,
            memory=self.memory,
            prompt=prompt,
            verbose=False  # Set True for debugging
        )
        
        print("✅ Conversation chain initialized with memory")
    
    def chat(self, user_message: str) -> str:
        """Send message and get response"""
        try:
            response = self.conversation.predict(input=user_message)
            return response.strip()
        except Exception as e:
            return f"Error: {str(e)}"
    
    def get_chat_history(self) -> str:
        """Get conversation history"""
        return self.memory.load_memory_variables({})["chat_history"]
    
    def clear_memory(self):
        """Clear conversation history"""
        self.memory.clear()
        print("🗑️  Conversation memory cleared")

    def generate_recommendations(self) -> List[dict]:
        """Generate top 3 business recommendations based on profile"""
        
        prompt = f"""
        Analyze this farmer's profile:
        {self.profile.to_context()}
        
        Available Business Options:
        {json.dumps(BUSINESS_OPTIONS, indent=2)}
        
        Task:
        Select exactly 3 business options from the list above that best match the farmer's land, capital, skills, and risk profile.
        
        Return ONLY a JSON array with this format:
        [
            {{
                "id": "business_id_1",
                "title": "Title 1",
                "reason": "Reason 1",
                "match_score": 95,
                "estimated_cost": "Cost 1",
                "profit_potential": "Profit 1",
                "requirements": ["Req 1", "Req 2"]
            }},
            {{
                "id": "business_id_2",
                "title": "Title 2",
                "reason": "Reason 2",
                "match_score": 90,
                "estimated_cost": "Cost 2",
                "profit_potential": "Profit 2",
                "requirements": ["Req 1", "Req 2"]
            }},
            {{
                "id": "business_id_3",
                "title": "Title 3",
                "reason": "Reason 3",
                "match_score": 85,
                "estimated_cost": "Cost 3",
                "profit_potential": "Profit 3",
                "requirements": ["Req 1", "Req 2"]
            }}
        ]
        
        Do not add any markdown formatting (like ```json). Just the raw JSON string.
        """
        
        try:
            print("🤔 Generating recommendations...")
            response = self.llm.invoke(prompt)
            
            # Robust JSON extraction
            cleaned_response = response.strip()
            
            # Remove markdown code fences
            cleaned_response = re.sub(r'```json\s*|\s*```', '', cleaned_response)
            
            # Try to extract JSON array from text (in case LLM added explanation)
            json_match = re.search(r'\[\s*\{.*\}\s*\]', cleaned_response, re.DOTALL)
            if json_match:
                cleaned_response = json_match.group(0)
            
            # Remove trailing commas before closing braces/brackets (common LLM error)
            cleaned_response = re.sub(r',(\s*[}\]])', r'\1', cleaned_response)
            
            # Try to parse JSON
            try:
                recommendations = json.loads(cleaned_response)
            except json.JSONDecodeError as json_err:
                print(f"⚠️  JSON parse error: {json_err}")
                print(f"📄 Raw response (first 500 chars): {response[:500]}")
                print(f"🧹 Cleaned response (first 500 chars): {cleaned_response[:500]}")
                raise  # Re-raise to trigger fallback
            
            # Ensure we strictly have 3 items and they match our ID list
            valid_ids = {b['id'] for b in BUSINESS_OPTIONS}
            valid_recs = [r for r in recommendations if r.get('id') in valid_ids]
            
            return valid_recs[:3]
            
        except Exception as e:
            print(f"❌ Error generating recommendations: {e}")
            # Fallback to defaults if LLM fails
            return [
                {
                    "id": "1", "title": "FLOWER PLANTATION (GERBERA)",
                    "reason": "High-value crop suitable for modern farming.",
                    "match_score": 90,
                    "estimated_cost": "₹1 Cr+",
                    "profit_potential": "₹20L+",
                    "requirements": ["1 Acre Land", "Greenhouse"]
                },
                {
                    "id": "5", "title": "DAIRY FARMING",
                    "reason": "Stable daily income source.",
                    "match_score": 85,
                    "estimated_cost": "₹10-12 Lakh",
                    "profit_potential": "₹20-40k/month",
                    "requirements": ["Fodder Land", "Cattle Shed"]
                },
                {
                    "id": "7", "title": "MUSHROOM FARMING",
                    "reason": "Low land requirement and quick returns.",
                    "match_score": 80,
                    "estimated_cost": "₹1.5-3 Lakh",
                    "profit_potential": "₹15-35k/month",
                    "requirements": ["Small Shed", "Humidity Control"]
                }
            ]


# ============================================
# PROFILE COLLECTION FUNCTIONS
# ============================================

def collect_farmer_profile() -> FarmerProfile:
    """Interactive questionnaire to collect farmer data"""
    print("\n" + "="*60)
    print("🌾 KRISHISAARTHI BUSINESS ADVISOR - FARMER PROFILING 🌾")
    print("="*60)
    print("\nPlease answer the following questions to help us assist you better:\n")
    
    # Language preference
    print("1. Language Preference / भाषा चुनें:")
    print("   1. English")
    print("   2. Hindi (हिंदी)")
    print("   3. Hinglish (Hindi-English Mix)")
    lang_choice = input("   Enter choice (1/2/3): ").strip()
    language_map = {"1": "english", "2": "hindi", "3": "hinglish"}
    language = language_map.get(lang_choice, "english")
    
    # Basic info
    name = input("\n2. Your name / आपका नाम: ").strip()
    
    land_size = float(input("\n3. Total land (in acres) / कुल जमीन (एकड़ में): "))
    
    capital = float(input("\n4. Available capital to invest (₹) / निवेश के लिए उपलब्ध पूंजी (₹): "))
    
    print("\n5. Market access / बाजार पहुंच:")
    print("   1. Good (within 10km)")
    print("   2. Moderate (10-30km)")
    print("   3. Poor (30km+)")
    market_choice = input("   Enter choice (1/2/3): ").strip()
    market_map = {"1": "good", "2": "moderate", "3": "poor"}
    market_access = market_map.get(market_choice, "moderate")
    
    print("\n6. Your skills/experience (select all that apply):")
    print("   Enter comma-separated: farming, dairy, poultry, business, solar, compost, horticulture")
    skills_input = input("   Skills / कौशल: ").strip()
    skills = [s.strip() for s in skills_input.split(",")]
    
    print("\n7. Risk tolerance / जोखिम सहनशीलता:")
    print("   1. Low (safe investments)")
    print("   2. Medium (balanced)")
    print("   3. High (willing to take risks)")
    risk_choice = input("   Enter choice (1/2/3): ").strip()
    risk_map = {"1": "low", "2": "medium", "3": "high"}
    risk_level = risk_map.get(risk_choice, "low")
    
    print("\n8. Time availability / समय उपलब्धता:")
    print("   1. Full-time")
    print("   2. Part-time")
    time_choice = input("   Enter choice (1/2): ").strip()
    time_availability = "full-time" if time_choice == "1" else "part-time"
    
    experience_years = int(input("\n9. Years of experience in agriculture/business (0 if none): "))
    
    profile = FarmerProfile(
        name=name,
        land_size=land_size,
        capital=capital,
        market_access=market_access,
        skills=skills,
        risk_level=risk_level,
        time_availability=time_availability,
        experience_years=experience_years,
        language=language
    )
    
    print("\n✅ Profile created successfully!\n")
    return profile


# ============================================
# MAIN CHAT INTERFACE
# ============================================

def start_chat_interface(advisor: KrishiSaarthiAdvisor):
    """Interactive chat loop"""
    print("\n" + "="*60)
    print("💬 CHAT WITH KRISHISAARTHI BUSINESS ADVISOR")
    print("="*60)
    print("\nCommands:")
    print("  /profile - View your profile")
    print("  /history - View conversation history")
    print("  /clear - Clear conversation memory")
    print("  /exit - Exit chat")
    print("\n" + "-"*60 + "\n")
    
    # Initial greeting
    greeting = advisor.chat("Hello! Please introduce yourself and ask how you can help me.")
    print(f"🤖 KrishiSaarthi: {greeting}\n")
    
    while True:
        user_input = input("👤 You: ").strip()
        
        if not user_input:
            continue
        
        # Handle commands
        if user_input.lower() == "/exit":
            print("\n👋 Thank you for using KrishiSaarthi! Best wishes for your business journey!")
            break
        
        elif user_input.lower() == "/profile":
            print("\n" + advisor.profile.to_context())
            continue
        
        elif user_input.lower() == "/history":
            history = advisor.get_chat_history()
            print(f"\n📜 Chat History:\n{history}\n")
            continue
        
        elif user_input.lower() == "/clear":
            advisor.clear_memory()
            continue
        
        # Get AI response
        response = advisor.chat(user_input)
        print(f"\n🤖 KrishiSaarthi: {response}\n")


# ============================================
# MAIN FUNCTION
# ============================================

def main():
    """Main entry point"""
    print("\n🌾 Welcome to KrishiSaarthi Business Advisor!")
    print("AI-powered business guidance for Indian farmers\n")
    
    # Step 1: Collect farmer profile
    farmer_profile = collect_farmer_profile()
    
    # Step 2: Initialize chatbot with profile
    advisor = KrishiSaarthiAdvisor(farmer_profile)
    
    # Step 3: Start chat interface
    start_chat_interface(advisor)


if __name__ == "__main__":
    main()