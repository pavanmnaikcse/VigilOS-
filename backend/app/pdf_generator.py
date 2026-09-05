from fpdf import FPDF
import io

def generate_case_pdf(case_file: dict) -> bytes:
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("helvetica", "B", 16)
    
    case_id = case_file.get("case_id", "Unknown")
    pdf.cell(0, 10, f"VigilOS Investigation Report: {case_id}", new_x="LMARGIN", new_y="NEXT", align="C")
    
    pdf.set_font("helvetica", "", 12)
    pdf.ln(10)
    
    txn = case_file.get("transaction", {})
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 10, "Transaction Details", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 12)
    
    pdf.cell(0, 8, f"Transaction ID: {txn.get('txn_id', 'Unknown')}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, f"Amount: ${txn.get('amount', 0):,.2f}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, f"Type: {txn.get('type', 'TRANSFER')}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, f"Sender: {txn.get('nameOrig', 'N/A')}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, f"Receiver: {txn.get('nameDest', 'N/A')}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, f"Timestamp: {txn.get('timestamp', 'Unknown')}", new_x="LMARGIN", new_y="NEXT")
    
    pdf.ln(5)
    fraud = case_file.get("fraud_score", {})
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 10, "Risk Assessment", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 12)
    
    pdf.cell(0, 8, f"Risk Score: {fraud.get('risk_score', 0.0)}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, f"Risk Level: {fraud.get('risk_level', 'LOW')}", new_x="LMARGIN", new_y="NEXT")
    
    pdf.ln(5)
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 10, "AI Agent Findings", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 12)
    
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "Risk Analyst:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 12)
    pdf.multi_cell(0, 8, str(fraud.get("reasoning", "No specific reasoning provided.")).encode('latin-1', 'replace').decode('latin-1'))
    
    expl = case_file.get("explanation", {})
    summary = expl.get("summary", "No summary.")
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "Executive Summary:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 12)
    pdf.multi_cell(0, 8, str(summary).encode('latin-1', 'replace').decode('latin-1'))
    
    ring = case_file.get("ring_detection", {})
    ring_count = ring.get("ring_count", 0)
    ring_text = f"Found {ring_count} rings involving {len(ring.get('accounts_involved', []))} accounts." if ring_count > 0 else "No obvious fan-in or fan-out money mule patterns detected in immediate neighborhood."
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "Behaviour Investigator:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 12)
    pdf.multi_cell(0, 8, str(ring_text).encode('latin-1', 'replace').decode('latin-1'))
    
    return bytes(pdf.output())
