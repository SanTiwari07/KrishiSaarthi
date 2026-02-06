from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama
from langchain_core.output_parsers import JsonOutputParser
from prompts import WASTE_TO_VALUE_SYSTEM_PROMPT, GUARDRAIL_PROMPT
import json

import os

class WasteToValueEngine:
    def __init__(self):
        model_name = os.getenv("OLLAMA_MODEL", "llama3.2")
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        
        self.llm = ChatOllama(
            model=model_name,
            temperature=0.2,
            format="json",
            base_url=base_url
        )
        
        # Separate LLM for chat (No JSON enforcement)
        self.chat_llm = ChatOllama(
            model=model_name,
            temperature=0.4,
            base_url=base_url
        )

        self.prompt = ChatPromptTemplate.from_messages([
            ("system", WASTE_TO_VALUE_SYSTEM_PROMPT + "\n" + GUARDRAIL_PROMPT),
            ("human", "{input}"),
        ])
        self.chain = self.prompt | self.llm | JsonOutputParser()

    def analyze_waste(self, crop_name: str) -> dict:
        """
        Analyzes the crop waste and returns structured JSON recommendations.
        """
        try:
            print(f"🥦 WasteToValueEngine: Analyzing {crop_name}...")
            response = self.chain.invoke({"input": crop_name})
            return response
        except Exception as e:
            print(f"❌ Error in WasteToValueEngine: {e}")
            # Fallback/Error response structure
            return {
                "crop": crop_name,
                "options": [],
                "conclusion": {
                    "title": "Analysis Failed",
                    "rationale": "Could not generate recommendations at this time. Please try again."
                },
                "error": str(e)
            }

    def chat_waste(self, context: dict, user_question: str) -> str:
        """
        Answers user questions based on the detailed waste analysis context.
        """
        chat_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a helpful agricultural expert assistant.
            The user has just received an analysis for converting specific crop waste into value.
            
            CONTEXT (The analysis results):
            {context_str}
            
            YOUR GOAL:
            Answer the user's question specifically based on the options provided in the context.
            
            FORMATTING RULES:
            - Use **Bold** for key numbers, machine names, and prices.
            - Use bullet points (•) for lists to make them readable.
            - **ALWAYS use double newlines** between paragraphs.
            - Keep responses concise but well-structured.
            - Be encouraging and practical (Indian context).
            
            Do not hallucinate new options not in the context unless asked for alternatives.
            """),
            ("human", "{question}"),
        ])
        
        # We use a string output parser for chat, not JSON
        from langchain_core.output_parsers import StrOutputParser
        
        # Use the non-JSON chat LLM
        chat_chain = chat_prompt | self.chat_llm | StrOutputParser()
        
        try:
            # Convert context dict to a readable string
            context_str = json.dumps(context, indent=2)
            
            print(f"💬 Chatting about waste... Q: {user_question}")
            response = chat_chain.invoke({
                "context_str": context_str, 
                "question": user_question
            })
            return response
        except Exception as e:
            print(f"❌ Error in Waste Chat: {e}")
            return "I apologize, but I'm having trouble connecting to the knowledge base right now. Please try again."
