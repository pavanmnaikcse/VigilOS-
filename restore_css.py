import json
log_path = r'C:\Users\pn466\.gemini\antigravity\brain\994c9320-8a29-46ae-8191-8c74ed5fea52\.system_generated\logs\transcript_full.jsonl'

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'Completed At: 2026-08-31T13:59:55+05:30' in line:
            try:
                data = json.loads(line)
                content = data.get('content', '')
                lines = content.split('\n')
                in_output = False
                css_content = []
                for l in lines:
                    if l.startswith('Output:'):
                        in_output = True
                        continue
                    if in_output:
                        css_content.append(l)
                
                with open('C:/Users/pn466/OneDrive/Documents/VigilOS/frontend/src/index.css', 'w', encoding='utf-8') as out:
                    out.write('\n'.join(css_content))
                print("Restored original index.css!")
                break
            except Exception as e:
                print(e)
