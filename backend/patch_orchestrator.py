
with open(r"C:\Users\pn466\OneDrive\Documents\VigilOS\backend\app\orchestrator.py", "r", encoding="utf-8") as f:
    content = f.read()

if "from app.report import generate_report" not in content:
    content = content.replace("from app.agents import", "from app.report import generate_report\nfrom app.agents import")

with open(r"C:\Users\pn466\OneDrive\Documents\VigilOS\backend\app\orchestrator.py", "w", encoding="utf-8") as f:
    f.write(content)

