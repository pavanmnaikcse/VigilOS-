import os
import glob
from urllib.parse import urlparse
from dotenv import load_dotenv
import chromadb
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

def index_docs():
    load_dotenv()
    
    chroma_url = os.getenv("CHROMA_URL", "http://localhost:8001")
    pdf_dir = "data/regulations"
    
    if not os.path.exists(pdf_dir):
        os.makedirs(pdf_dir, exist_ok=True)
        
    pdf_files = glob.glob(os.path.join(pdf_dir, "*.pdf"))
    if not pdf_files:
        print(f"No PDF files found in {pdf_dir}/. Please place regulation PDFs there.")
        return
        
    print(f"Found {len(pdf_files)} PDFs. Connecting to ChromaDB at {chroma_url}...")
    
    parsed_url = urlparse(chroma_url)
    client = chromadb.HttpClient(host=parsed_url.hostname or "localhost", port=parsed_url.port or 8001)
    
    collection = client.get_or_create_collection(name="regulations")
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    
    all_chunks = []
    all_ids = []
    all_metadatas = []
    
    for pdf_file in pdf_files:
        print(f"Processing {pdf_file}...")
        loader = PyPDFLoader(pdf_file)
        docs = loader.load()
        chunks = text_splitter.split_documents(docs)
        
        for i, chunk in enumerate(chunks):
            all_chunks.append(chunk.page_content)
            all_ids.append(f"{os.path.basename(pdf_file)}_{chunk.metadata.get('page', 0)}_{i}")
            all_metadatas.append({"source": os.path.basename(pdf_file), "page": chunk.metadata.get("page", 0)})
            
    print(f"Adding {len(all_chunks)} chunks to ChromaDB...")
    
    batch_size = 500
    for i in range(0, len(all_chunks), batch_size):
        batch_chunks = all_chunks[i:i+batch_size]
        batch_ids = all_ids[i:i+batch_size]
        batch_metadatas = all_metadatas[i:i+batch_size]
        
        collection.upsert(
            documents=batch_chunks,
            ids=batch_ids,
            metadatas=batch_metadatas
        )
        
    print("Indexing complete.")
    print(f"Total chunks in collection 'regulations': {collection.count()}")

if __name__ == "__main__":
    index_docs()
