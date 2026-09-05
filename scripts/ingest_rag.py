import os
import chromadb
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma

# ChromaDB connection settings
CHROMA_URL = os.getenv("CHROMA_URL", "http://localhost:8001")
CHROMA_HOST = CHROMA_URL.replace("http://", "").split(":")[0]
CHROMA_PORT = int(CHROMA_URL.replace("http://", "").split(":")[1])

def ingest_data(data_directory: str, collection_name: str = "vigilos_compliance_rules"):
    print(f"Loading documents from {data_directory}...")
    
    # 1. Load Documents
    loader = DirectoryLoader(data_directory, glob="**/*.txt", loader_cls=TextLoader)
    documents = loader.load()
    
    if not documents:
        print("No documents found to ingest!")
        return

    print(f"Loaded {len(documents)} documents. Splitting text into chunks...")

    # 2. Text Splitting (Chunking)
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Created {len(chunks)} text chunks.")

    # 3. Embedding Generation
    print("Initializing Ollama Embeddings...")
    embeddings = OllamaEmbeddings(
        model="nomic-embed-text",
        base_url="http://localhost:11434"
    )

    # 4. Ingest into ChromaDB
    print(f"Connecting to ChromaDB at {CHROMA_HOST}:{CHROMA_PORT}...")
    chroma_client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
    
    print(f"Ingesting chunks into collection '{collection_name}'...")
    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        client=chroma_client,
        collection_name=collection_name
    )

    print("Ingestion complete! Data pipeline finished successfully.")

if __name__ == "__main__":
    os.makedirs("../data/compliance", exist_ok=True)
    if len(os.listdir("../data/compliance")) == 0:
        with open("../data/compliance/rbi_rules.txt", "w") as f:
            f.write("RBI Guideline 42.1: Any transaction over 50000 INR transferring to an account less than 1 day old must be flagged for manual review.\n")
            f.write("RBI Guideline 42.2: Circular fund routing across 3 or more nodes within 1 hour is considered a High Risk Typology.")
            
    ingest_data("../data/compliance")
