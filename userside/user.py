from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import requests
import json
import os
from dotenv import load_dotenv
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Corruption Reporting Assistant API",
    description="API for providing guidance on corruption-related incidents in India",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://satark-ai.vercel.app",
        "https://satark-ai.onrender.com",
        "http://localhost:3000",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input model for the query
class Query(BaseModel):
    question: str

# Response model
class Response(BaseModel):
    answer: str
    status: str
    error: Optional[str] = None

def get_rag_response(query: str) -> str:
    """
    Get response from the RAG API
    """
    try:
        api_url = "https://satark-ai-f0xr.onrender.com/investigation"
        response = requests.post(
            api_url,
            json={"question": query}
        )
        response.raise_for_status()
        return response.json()["answer"]
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=503,
            detail=f"Error calling RAG API: {str(e)}"
        )

def get_enhanced_response(user_query: str) -> str:
    """
    Get enhanced response using Groq
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY not found in environment variables"
        )

    try:
        # Initialize GROQ
        chat_model = ChatGroq(
            model_name="mixtral-8x7b-32768",
            temperature=0,
            api_key=api_key
        )
        
        # Get initial RAG response
        rag_response = get_rag_response(user_query)
        
        # Create prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a helpful assistant specializing in providing accurate and actionable advice about corruption and legal matters in India. 
            Given a user query and reference information:
            1. Analyze the situation carefully
            2. Provide immediate actionable steps
            3. Include relevant legal rights and protections
            4. Give specific contact information for authorities
            5. Maintain a supportive but professional tone
            
            Structure your response in this format:
            1. Immediate Steps
            2. Your Rights
            3. How to Report
            4. Additional Precautions
            
            Be concise but thorough. Focus on practical, safe actions the user can take."""),
            ("user", f"""User Query: {user_query}
            
            Reference Information: {rag_response}
            
            Provide a clear, structured response.""")
        ])
        
        # Get response
        response = chat_model.invoke(prompt.format_messages())
        return response.content
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )

@app.get("/")
async def root():
    """
    Root endpoint - Health check
    """
    return {
        "status": "active",
        "message": "Corruption Reporting Assistant API is running"
    }

@app.post("/user", response_model=Response)
async def process_query(query: Query):
    """
    Process a corruption-related query and return enhanced guidance
    """
    try:
        answer = get_enhanced_response(query.question)
        return Response(
            answer=answer,
            status="success"
        )
    except HTTPException as e:
        return Response(
            answer="",
            status="error",
            error=str(e.detail)
        )
    except Exception as e:
        return Response(
            answer="",
            status="error",
            error=f"Unexpected error: {str(e)}"
        )

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)