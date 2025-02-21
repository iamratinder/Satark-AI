from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Legal RAG API")

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

# Define paths
BASE_DIR = Path(__file__).parent
CHROMA_DB_DIR = BASE_DIR / "chroma_db"
INVESTIGATION_DB_DIR = BASE_DIR / "investigation_db"

# Initialize global variables
qa_db = None
qa_chain = None
investigation_db = None
investigation_chain = None

class Query(BaseModel):
    question: str

def initialize_db(db_path: Path):
    """Initialize ChromaDB and return the database instance"""
    embedding_function = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    if db_path.exists():
        print(f"Loading existing ChromaDB from {db_path}...")
        return Chroma(
            persist_directory=str(db_path),
            embedding_function=embedding_function
        )
    else:
        raise RuntimeError(
            f"ChromaDB directory not found at {db_path}. "
            "Please ensure the database exists."
        )

def setup_chain(db, system_prompt: str):
    """Set up the retrieval chain with ChatGroq"""
    chat_model = ChatGroq(
        model_name="mixtral-8x7b-32768",
        temperature=0,
        api_key=os.getenv("GROQ_API_KEY")
    )
    
    prompt = ChatPromptTemplate.from_template(system_prompt)
    
    doc_chain = create_stuff_documents_chain(chat_model, prompt)
    retriever = db.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 4}
    )
    return create_retrieval_chain(retriever, doc_chain)

@app.on_event("startup")
async def startup_event():
    """Initialize both databases and chains when the API starts"""
    global qa_db, qa_chain, investigation_db, investigation_chain
    try:
        # Initialize QA database and chain
        qa_db = initialize_db(CHROMA_DB_DIR)
        qa_chain = setup_chain(qa_db, """
        Answer the following question based only on the provided context.
        Think step by step before providing a detailed answer.
        Also make sure do not include like from the context provided or from database just provide a professional and sophisticated.
        I will tip you $1000 if the user finds the answer helpful.
        <context>
        {context}
        </context>
        Question: {input}""")
        
        # Initialize Investigation database and chain
        investigation_db = initialize_db(INVESTIGATION_DB_DIR)
        investigation_chain = setup_chain(investigation_db, """
        Analyze the following investigation-related question based on the provided context.
        Think step by step and provide a detailed analysis with potential insights and recommendations.
        Focus on identifying patterns, risks, and actionable intelligence.
        <context>
        {context}
        </context>
        Question: {input}""")
    except Exception as e:
        print(f"Error during initialization: {e}")
        raise e

@app.post("/qa")
async def answer_question(query: Query):
    """Endpoint to answer questions based on the legal document"""
    if not qa_db or not qa_chain:
        raise HTTPException(
            status_code=500,
            detail="QA system not properly initialized. Please check server logs."
        )
    
    try:
        response = qa_chain.invoke({"input": query.question})
        return {"answer": response['answer']}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing question: {str(e)}"
        )

@app.post("/investigation")
async def investigate_question(query: Query):
    """Endpoint to answer investigation-related questions"""
    if not investigation_db or not investigation_chain:
        raise HTTPException(
            status_code=500,
            detail="Investigation system not properly initialized. Please check server logs."
        )
    
    try:
        response = investigation_chain.invoke({"input": query.question})
        return {"answer": response['answer']}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing investigation question: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Endpoint to check if both services are running and properly initialized"""
    return {
        "status": "healthy",
        "qa_database_initialized": qa_db is not None,
        "qa_chain_initialized": qa_chain is not None,
        "investigation_database_initialized": investigation_db is not None,
        "investigation_chain_initialized": investigation_chain is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)