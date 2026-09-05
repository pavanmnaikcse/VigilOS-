from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import os

def create_pdf(filename):
    doc = SimpleDocTemplate(filename, pagesize=letter)
    styles = getSampleStyleSheet()
    
    title_style = styles['Heading1']
    title_style.alignment = 1
    subtitle_style = styles['Heading2']
    normal_style = styles['Normal']
    normal_style.fontSize = 11
    normal_style.leading = 14
    code_style = ParagraphStyle(
        'Code', parent=styles['Normal'], fontName='Courier', fontSize=9,
        backColor=colors.lightgrey, borderPadding=5, leading=12
    )

    story = []

    story.append(Paragraph('ChromaDB Extraction Pipeline Architecture', title_style))
    story.append(Spacer(1, 20))
    
    story.append(Paragraph('1. Overview', subtitle_style))
    story.append(Paragraph('This document outlines the extraction pipeline (RAG architecture) used to pull regulatory rules from the local ChromaDB vector store. The database stores parsed RBI regulations, Anti-Money Laundering (AML) policies, and suspicious activity definitions.', normal_style))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph('2. Pipeline Components', subtitle_style))
    
    data = [
        ['Component', 'Technology', 'Description'],
        ['Embeddings', 'Ollama (nomic-embed-text)', 'Generates highly semantic 768-dimensional vectors from incoming queries to match the stored regulation data.'],
        ['Vector Store', 'ChromaDB', 'Local vector database running on port 8001 via Docker, storing chunks of compliance documents.'],
        ['Integration', 'LangChain', 'Orchestrates the connection between the embedding model, ChromaDB, and the VigilOS Compliance Agent.'],
        ['Similarity Metric', 'L2 (Euclidean) / Cosine', 'Calculates the mathematical distance between the transaction alert and the regulatory laws.']
    ]
    
    t = Table(data, colWidths=[100, 150, 200])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2b2d42')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#edf2f4')),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    story.append(t)
    story.append(Spacer(1, 20))
    
    story.append(Paragraph('3. Step-by-Step Extraction Flow', subtitle_style))
    flow_text = """
    <b>Step 1: Context Preparation</b><br/>
    The Compliance Agent detects a suspicious transaction and generates a natural language query (e.g., 'What are the rules regarding rapid cash transfers over $50k?').<br/><br/>
    <b>Step 2: Query Embedding</b><br/>
    The query is sent to the local Ollama instance running the 'nomic-embed-text' model, converting the text into a numerical vector.<br/><br/>
    <b>Step 3: Vector Search</b><br/>
    The LangChain Chroma client connects to the ChromaDB HTTP server (port 8001). It performs a k-Nearest Neighbors (k-NN) similarity search against the 'vigilos_compliance_rules' collection.<br/><br/>
    <b>Step 4: Context Injection</b><br/>
    The top K most relevant text chunks are extracted, scored, and injected directly into the prompt context for the LLM to make a final compliance judgment.
    """
    story.append(Paragraph(flow_text, normal_style))
    story.append(Spacer(1, 20))

    story.append(Paragraph('4. Extraction Code Snippet', subtitle_style))
    code_text = """
embeddings = OllamaEmbeddings(model="nomic-embed-text")<br/>
client = chromadb.HttpClient(host="localhost", port=8001)<br/>
vectorstore = Chroma(client=client, collection_name="vigilos_compliance_rules", embedding_function=embeddings)<br/>
<br/>
# Execute Extraction Pipeline<br/>
results = vectorstore.similarity_search_with_score(query_text, k=3)<br/>
for doc, score in results:<br/>
&nbsp;&nbsp;&nbsp;&nbsp;print(doc.page_content)<br/>
    """
    story.append(Paragraph(code_text, code_style))

    doc.build(story)
    print(f"PDF successfully generated at {os.path.abspath(filename)}")

if __name__ == '__main__':
    create_pdf('ChromaDB_Extraction_Pipeline_Requirement.pdf')
