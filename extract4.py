import json
log_path = r'C:\Users\pn466\.gemini\antigravity\brain\994c9320-8a29-46ae-8191-8c74ed5fea52\.system_generated\logs\transcript_full.jsonl'

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'File Path: ile:///C:/Users/pn466/OneDrive/Documents/VigilOS/frontend/src/index.css' in line:
            try:
                data = json.loads(line)
                content = data.get('content', '')
                if 'body' in content or 'bg-slate-950' in content or '@tailwind' in content:
                    print("Found candidate!")
                    with open('C:/Users/pn466/OneDrive/Documents/VigilOS/frontend/src/index.css.backup', 'w', encoding='utf-8') as out:
                        for l in content.split('\n'):
                            if ':' in l and l.split(':')[0].isdigit():
                                out.write(l.split(':', 1)[1][1:] + '\n')
                    break
            except Exception as e:
                pass
