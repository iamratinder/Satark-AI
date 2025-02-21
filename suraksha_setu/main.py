from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
import os
from dotenv import load_dotenv
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Law Enforcement Response API",
    description="API for law enforcement and government officials",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple Query and Response Models
class Query(BaseModel):
    question: str

class Response(BaseModel):
    answer: str
    status: str
    error: Optional[str] = None

def initialize_vector_store(context_path: str):
    """Initialize FAISS vector store with the context data"""
    try:
        with open(context_path, 'r') as file:
            context_text = file.read()
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        texts = text_splitter.split_text(context_text)
        
        embeddings = HuggingFaceEmbeddings(model_name="paraphrase-MiniLM-L3-v2")
        vector_store = FAISS.from_texts(texts, embeddings)
        
        return vector_store
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error initializing vector store: {str(e)}"
        )

vector_store = initialize_vector_store("connaught_place_context.txt")

def get_enhanced_response(query: str, system_prompt: str) -> str:
    """Get enhanced response using RAG with Groq"""
    try:
        relevant_docs = vector_store.similarity_search(query, k=3)
        context = "\n".join([doc.page_content for doc in relevant_docs])
        
        chat_model = ChatGroq(
            model_name="mixtral-8x7b-32768",
            temperature=0,
            api_key=os.getenv("GROQ_API_KEY")
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("user", f"""Context: {context}
            
            Query: {query}
            
            Provide a clear, actionable response.""")
        ])
        
        response = chat_model.invoke(prompt.format_messages())
        return response.content
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "active",
        "message": "Law Enforcement Response API is running"
    }

@app.post("/tactical")
async def tactical_response(query: Query):
    """Get tactical response guidance"""
    system_prompt = """You are a tactical response advisor for law enforcement.
    Provide specific guidance focusing on:
    1. Immediate tactical actions
    2. Crowd control strategies
    3. Strategic positions
    4. Communication protocols
    5. Safety measures"""
    
    try:
        answer = get_enhanced_response(query.question, system_prompt)
        return Response(answer=answer, status="success")
    except Exception as e:
        return Response(answer="", status="error", error=str(e))

@app.post("/command")
async def command_center(query: Query):
    """Get command center coordination guidance"""
    system_prompt = """You are a command center coordinator.
    Provide guidance focusing on:
    1. Deployment strategies
    2. Department coordination
    3. Resource allocation
    4. Emergency protocols
    5. Communication channels"""
    
    try:
        answer = get_enhanced_response(query.question, system_prompt)
        return Response(answer=answer, status="success")
    except Exception as e:
        return Response(answer="", status="error", error=str(e))

@app.post("/security")
async def security_assessment(query: Query):
    """Get security situation assessment"""
    system_prompt = """You are a security assessment specialist.
    Provide analysis focusing on:
    1. Threat assessment
    2. Vulnerability analysis
    3. Critical areas
    4. Security measures
    5. Safety priorities"""
    
    try:
        answer = get_enhanced_response(query.question, system_prompt)
        return Response(answer=answer, status="success")
    except Exception as e:
        return Response(answer="", status="error", error=str(e))


@app.post("/evacuation")
async def evacuation_management(query: Query):
    """Evacuation planning and management"""
    system_prompt = """You are an evacuation and crowd management specialist for Connaught Place.

    You are an evacuation and crowd management specialist for Connaught Place, New Delhi. Assess the current crowd density, exit route status, and transport availability. Based on this, develop a structured evacuation plan with: (1) Primary routes including main exit pathways, crowd flow management, and bottleneck prevention; (2) Alternative routes such as secondary exits, emergency pathways, and backup routes; (3) Special considerations for disabled access, elderly assistance, and medical emergencies. Finally, outline coordination requirements for traffic management, public transport adjustments, and emergency vehicle access, ensuring all recommendations align with Connaught Place's architecture and infrastructure."""
    
    try:
        answer = get_enhanced_response(query.question, system_prompt)
        return Response(answer=answer, status="success")
    except Exception as e:
        return Response(answer="", status="error", error=str(e))

@app.post("/evidence")
async def evidence_handling(query: Query):
    """Evidence collection and preservation guidance"""
    system_prompt = """You are a senior forensics and evidence handling specialist. Assess the crime scene status, evidence types, and environmental factors. Provide structured guidance on: (1) Documentation, including photography, video, and written records; (2) Collection procedures for physical, digital, and testimonial evidence; (3) Preservation methods covering storage, chain of custody, and transportation. Ensure all recommendations maintain evidence integrity and comply with legal procedures."""
    
    try:
        answer = get_enhanced_response(query.question, system_prompt)
        return Response(answer=answer, status="success")
    except Exception as e:
        return Response(answer="", status="error", error=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))  # Default to 8000 if PORT is not set
    uvicorn.run(app, host="0.0.0.0", port=port)