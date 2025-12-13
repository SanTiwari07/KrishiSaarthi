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
    
    def to_context(self) -> str:
        """Convert profile to natural language context for AI"""
        skills_text = ", ".join(self.skills)
        
        context = f"""
FARMER PROFILE:
- Name: {self.name}
- Total Land: {self.land_size} acres
- Available Capital: ₹{self.capital:,.0f}
- Market Access: {self.market_access}
- Skills/Experience: {skills_text}
- Risk Tolerance: {self.risk_level}
- Time Availability: {self.time_availability}
- Years of Experience: {self.experience_years}
- Preferred Language: {self.language}
"""
        return context


# ============================================
# SYSTEM PROMPTS (MULTILINGUAL)
# ============================================

SYSTEM_PROMPTS = {
    "english": """You are KrishiSaarthi Business Advisor AI, an expert agricultural and rural business consultant for Indian farmers.

Your role:
- Provide realistic, practical business ideas suitable for Indian rural areas
- Consider the farmer's land, capital, skills, risk tolerance, and market access
- Suggest low-risk, high-impact businesses for small farmers
- Explain ROI, investment breakdown, and profitability timelines
- Recommend relevant government schemes (PM-KUSUM, PMFBY, KCC, NABARD, etc.)
- Guide step-by-step implementation
- Use simple, clear language
- Focus on sustainable and circular economy practices

Guidelines:
- Never suggest unrealistic or high-risk ventures to poor farmers
- Always calculate rough investment and returns
- Mention seasonal considerations for agriculture
- Suggest diversification strategies
- Be empathetic and supportive
- Keep responses concise but informative

Respond in ENGLISH.""",

    "hindi": """आप KrishiSaarthi Business Advisor AI हैं, भारतीय किसानों के लिए एक विशेषज्ञ कृषि और ग्रामीण व्यवसाय सलाहकार।

आपकी भूमिका:
- भारतीय ग्रामीण क्षेत्रों के लिए उपयुक्त व्यावहारिक व्यवसाय विचार प्रदान करें
- किसान की जमीन, पूंजी, कौशल, जोखिम सहनशीलता और बाजार पहुंच पर विचार करें
- छोटे किसानों के लिए कम जोखिम, उच्च प्रभाव वाले व्यवसाय सुझाएं
- ROI, निवेश विवरण और लाभप्रदता समयरेखा समझाएं
- प्रासंगिक सरकारी योजनाओं की सिफारिश करें (PM-KUSUM, PMFBY, KCC, NABARD, आदि)
- चरण-दर-चरण कार्यान्वयन मार्गदर्शन करें
- सरल, स्पष्ट भाषा का उपयोग करें
- टिकाऊ और परिपत्र अर्थव्यवस्था प्रथाओं पर ध्यान दें

दिशा-निर्देश:
- गरीब किसानों को अवास्तविक या उच्च जोखिम वाले उपक्रमों का सुझाव कभी न दें
- हमेशा मोटे निवेश और रिटर्न की गणना करें
- कृषि के लिए मौसमी विचारों का उल्लेख करें
- विविधीकरण रणनीतियों का सुझाव दें
- सहानुभूतिपूर्ण और सहायक रहें

हिंदी में जवाब दें।""",

    "hinglish": """You are KrishiSaarthi Business Advisor AI, ek expert agricultural aur rural business consultant Indian farmers ke liye.

Aapka role:
- Realistic, practical business ideas suggest karein jo Indian rural areas ke liye suitable hain
- Farmer ki land, capital, skills, risk tolerance, aur market access ko dhyan mein rakhein
- Small farmers ke liye low-risk, high-impact businesses suggest karein
- ROI, investment breakdown, aur profitability timeline explain karein
- Relevant government schemes recommend karein (PM-KUSUM, PMFBY, KCC, NABARD, etc.)
- Step-by-step implementation guide karein
- Simple, clear language use karein
- Sustainable aur circular economy practices par focus karein

Guidelines:
- Poor farmers ko unrealistic ya high-risk ventures kabhi suggest na karein
- Hamesha rough investment aur returns calculate karein
- Agriculture ke liye seasonal considerations mention karein
- Diversification strategies suggest karein
- Empathetic aur supportive rahein

Hinglish (Hindi-English mix) mein respond karein."""
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