import json

log_path = r'C:\Users\pn466\.gemini\antigravity\brain\994c9320-8a29-46ae-8191-8c74ed5fea52\.system_generated\logs\transcript_full.jsonl'

found = False
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'File Path: ile:///C:/Users/pn466/OneDrive/Documents/VigilOS/frontend/src/index.css' in line:
            try:
                data = json.loads(line)
                content = data.get('content', '')
                if '1: @import "tailwindcss"' in content:
                    lines = content.split('\n')
                    # check if it has more than 50 lines
                    if len(lines) > 50:
                        with open('C:/Users/pn466/OneDrive/Documents/VigilOS/frontend/src/index.css.backup', 'w', encoding='utf-8') as out:
                            for l in lines:
                                if ':' in l and l.split(':')[0].isdigit():
                                    out.write(l.split(':', 1)[1][1:] + '\n')
                        print("Restored successfully")
                        found = True
                        break
            except Exception as e:
                pass

if not found:
    print("Not found")
