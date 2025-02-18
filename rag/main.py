import os
from dotenv import load_dotenv

load_dotenv()

from langchain_community.document_loaders.pdf import PyPDFLoader
loader = PyPDFLoader("repealedfileopen.pdf")
docs = loader.load()

from langchain.text_splitter import RecursiveCharacterTextSplitter
text_splitter = RecursiveCharacterTextSplitter(chunk_size = 1000, chunk_overlap = 200)
documents = text_splitter.split_documents(docs)

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
# Use a free embedding model
embedding_function = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

db = Chroma.from_documents(documents[:50], embedding_function)

print("Successfully stored embeddings in ChromaDB!")

query = "Ratinder"
retireved_results = db.similarity_search(query)
print(retireved_results[0].page_content)

from langchain_groq import ChatGroq

chat_model = ChatGroq(model_name="mixtral-8x7b-32768", temperature=0, api_key=os.getenv("GROQ_API_KEY"))

from langchain_core.prompts import ChatPromptTemplate
prompt = ChatPromptTemplate.from_template("""
Answer the following question based only on the provided context.
Think step by step before providing a detailed answer.
I will tip you $1000 if the user finds the answer helpful.
<context>
{context}
</context
Question : {input}""")

from langchain.chains.combine_documents import create_stuff_documents_chain
doc_chain = create_stuff_documents_chain(chat_model, prompt)

retriever = db.as_retriever()

from langchain.chains import create_retrieval_chain
retrieval_chain = create_retrieval_chain(retriever, doc_chain)

response = retrieval_chain.invoke({"input": "suppose vansh attempts to murder chahat but anyhow chahat escapes what punishment will be given to vansh and under what ipc?"})

print(response['answer'])