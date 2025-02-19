import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_community.document_loaders.pdf import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain

# Load environment variables
load_dotenv()

# Define paths
BASE_DIR = Path(__file__).parent
PDF_PATH = BASE_DIR / "repealedfileopen.pdf"
CHROMA_DB_DIR = BASE_DIR / "chroma_db"

def create_or_load_db():
    """Create a new ChromaDB instance or load existing one"""
    # Check if PDF exists
    if not PDF_PATH.exists():
        raise FileNotFoundError(
            f"PDF file not found at {PDF_PATH}. "
            f"Please ensure 'repealedfileopen.pdf' is in the same directory as this script: {BASE_DIR}"
        )
    
    # Initialize embedding function
    embedding_function = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    # Check if database already exists
    if CHROMA_DB_DIR.exists():
        print(f"Loading existing ChromaDB from {CHROMA_DB_DIR}...")
        db = Chroma(
            persist_directory=str(CHROMA_DB_DIR),
            embedding_function=embedding_function
        )
        return db
    
    # If database doesn't exist, create new one
    print(f"Creating new ChromaDB at {CHROMA_DB_DIR}...")
    print(f"Using PDF from: {PDF_PATH}")
    
    # Load PDF
    loader = PyPDFLoader(str(PDF_PATH))
    docs = loader.load()
    
    # Split documents
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    documents = text_splitter.split_documents(docs)
    
    # Create and persist database
    db = Chroma.from_documents(
        documents[:50],
        embedding_function,
        persist_directory=str(CHROMA_DB_DIR)
    )
    db.persist()
    print("Successfully stored embeddings in ChromaDB!")
    return db

def setup_chain(db):
    """Set up the retrieval chain with ChatGroq"""
    chat_model = ChatGroq(
        model_name="mixtral-8x7b-32768",
        temperature=0,
        api_key=os.getenv("GROQ_API_KEY")
    )
    
    prompt = ChatPromptTemplate.from_template("""
    Answer the following question based only on the provided context.
    Think step by step before providing a detailed answer in a very professional and expalainable way.
    I will tip you $1000 if the user finds the answer helpful.
    <context>
    {context}
    </context>
    Question: {input}""")
    
    doc_chain = create_stuff_documents_chain(chat_model, prompt)
    retriever = db.as_retriever()
    return create_retrieval_chain(retriever, doc_chain)

def main():
    try:
        # Print current working directory and file locations
        print(f"Current working directory: {os.getcwd()}")
        print(f"Script location: {BASE_DIR}")
        print(f"Looking for PDF at: {PDF_PATH}")
        print(f"ChromaDB will be stored at: {CHROMA_DB_DIR}")
        
        # Create or load database
        db = create_or_load_db()
        
        # Set up retrieval chain
        retrieval_chain = setup_chain(db)
        
        # Example query
        query = "suppose vansh attempts to murder chahat but anyhow chahat escapes what punishment will be given to vansh and under what ipc?"
        response = retrieval_chain.invoke({"input": query})
        print(response['answer'])
        
    except FileNotFoundError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()