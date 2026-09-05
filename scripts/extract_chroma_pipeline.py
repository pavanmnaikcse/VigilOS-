import os
import chromadb
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma

CHROMA_URL = os.getenv("CHROMA_URL", "http://localhost:8001")
CHROMA_HOST = CHROMA_URL.replace("http://", "").split(":")[0]
CHROMA_PORT = int(CHROMA_URL.replace("http://", "").split(":")[1])

def extract_regulations(query_text: str, k: int = 3, collection_name: str = "vigilos_compliance_rules"):
    print(f"Connecting to ChromaDB at {CHROMA_HOST}:{CHROMA_PORT}")
    
    # Use the exact same embedding model used for ingestion
    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    
    client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
    
    vectorstore = Chroma(
        client=client,
        collection_name=collection_name,
        embedding_function=embeddings
    )
    
    print(f"\n[Search Pipeline] Querying ChromaDB for: '{query_text}'")
    results = vectorstore.similarity_search_with_score(query_text, k=k)
    
    extracted_data = []
    print("\n--- Extracted Context from ChromaDB ---")
    for doc, score in results:
        print(f"\n[Similarity Score: {score:.4f}]")
        print(f"Content: {doc.page_content}")
        extracted_data.append({
            "content": doc.page_content,
            "metadata": doc.metadata,
            "score": score
        })
    print("---------------------------------------")
    
    return extracted_data

if __name__ == "__main__":
    import sys
    query = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "What are the limits for suspicious cash transactions?"
    extract_regulations(query)

