import os
# import boto3
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
import chromadb
# from chromadb.config import Settings
# import time

# Load environment variables
load_dotenv()

# AWS Credentials
# AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID')
# AWS_SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
# EC2_REGION = 'us-east-1'  # Change to your preferred region

BASE_DIR = Path(__file__).parent
PDF_PATH = BASE_DIR / "repealedfileopen.pdf"
CHROMA_DB_DIR = BASE_DIR / "chroma_db"



# # Define paths and configuration
# BASE_DIR = Path(__file__).parent
# PDF_PATH = BASE_DIR / "repealedfileopen.pdf"

# # After you launch EC2, replace this with your instance's public DNS
# CHROMA_SERVER_HOST = "ec2-13-48-5-146.eu-north-1.compute.amazonaws.com"  # e.g., ec2-xx-xx-xx-xx.compute-1.amazonaws.com
# CHROMA_SERVER_PORT = "8000"
# COLLECTION_NAME = "legal_documents"

# def verify_aws_credentials():
#     """Verify AWS credentials are working"""
#     try:
#         # Create EC2 client
#         ec2 = boto3.client(
#             'ec2',
#             aws_access_key_id=AWS_ACCESS_KEY,
#             aws_secret_access_key=AWS_SECRET_KEY,
#             region_name=EC2_REGION
#         )
        
#         # Test API call
#         ec2.describe_instances()
#         print("AWS credentials verified successfully!")
#         return True
#     except Exception as e:
#         print(f"AWS credential verification failed: {e}")
#         return False

# def wait_for_server(max_attempts=5):
#     """Wait for ChromaDB server to be ready"""
#     attempt = 0
#     while attempt < max_attempts:
#         try:
#             client = chromadb.HttpClient(
#                 host=CHROMA_SERVER_HOST,
#                 port=CHROMA_SERVER_PORT,
#                 settings=Settings(
#                     chroma_client_auth_enabled=False
#                 )
#             )
#             client.heartbeat()
#             print("Successfully connected to ChromaDB server!")
#             return True
#         except Exception as e:
#             attempt += 1
#             print(f"Waiting for server... Attempt {attempt}/{max_attempts}")
#             time.sleep(2)
    
#     raise ConnectionError("Could not connect to ChromaDB server. Make sure your EC2 instance is running.")

def create_or_load_db():
    """Create a new ChromaDB instance or load existing one from server"""
    # # Verify AWS credentials first
    # if not verify_aws_credentials():
    #     raise Exception("AWS credentials verification failed. Please check your credentials.")
    
    # Check if PDF exists
    if not PDF_PATH.exists():
        raise FileNotFoundError(
            f"PDF file not found at {PDF_PATH}. "
            f"Please ensure 'repealedfileopen.pdf' is in the same directory as this script: {BASE_DIR}"
        )
    
    # Wait for server to be ready
    # wait_for_server()
    
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

    # # Initialize ChromaDB client
    # chroma_client = chromadb.HttpClient(
    #     host=CHROMA_SERVER_HOST,
    #     port=CHROMA_SERVER_PORT,
    #     settings=Settings(
    #         chroma_client_auth_enabled=False
    #     )
    # )
    
    # try:
    #     # Try to get existing collection
    #     print(f"Attempting to load collection '{COLLECTION_NAME}' from ChromaDB server...")
    #     collection = chroma_client.get_collection(name=COLLECTION_NAME)
    #     print("Collection found!")
    # except Exception as e:
    #     print(f"Collection not found, creating new one...")
    #     # Load and process PDF
    #     loader = PyPDFLoader(str(PDF_PATH))
    #     docs = loader.load()
        
    #     # Split documents
    #     text_splitter = RecursiveCharacterTextSplitter(
    #         chunk_size=1000,
    #         chunk_overlap=200
    #     )
    #     documents = text_splitter.split_documents(docs)
        
    #     # Create new collection
    #     collection = chroma_client.create_collection(name=COLLECTION_NAME)
        
    #     # Add documents to collection
    #     for i, doc in enumerate(documents[:50]):
    #         collection.add(
    #             documents=[doc.page_content],
    #             metadatas=[doc.metadata],
    #             ids=[f"doc_{i}"]
    #         )
    #     print("Successfully stored documents in ChromaDB!")
    
    # # Create Langchain Chroma instance
    # db = Chroma(
    #     client=chroma_client,
    #     collection_name=COLLECTION_NAME,
    #     embedding_function=embedding_function
    # )
    

def setup_chain(db):
    """Set up the retrieval chain with ChatGroq"""
    chat_model = ChatGroq(
        model_name="mixtral-8x7b-32768",
        temperature=0,
        api_key=os.getenv("GROQ_API_KEY")
    )
    
    prompt = ChatPromptTemplate.from_template("""
    Answer the following question based only on the provided context.
    Think step by step before providing a detailed answer.
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
        # Print configuration
        # Print current working directory and file locations
        print(f"Current working directory: {os.getcwd()}")
        print(f"Script location: {BASE_DIR}")
        print(f"Looking for PDF at: {PDF_PATH}")
        print(f"ChromaDB will be stored at: {CHROMA_DB_DIR}")
        # print(f"Connecting to ChromaDB server at {CHROMA_SERVER_HOST}:{CHROMA_SERVER_PORT}")
        
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