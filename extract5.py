import json
log_path = r'C:\Users\pn466\.gemini\antigravity\brain\994c9320-8a29-46ae-8191-8c74ed5fea52\.system_generated\logs\transcript_full.jsonl'

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'app-bg' in line:
            try:
                data = json.loads(line)
                content = data.get('content', '')
                if 'app-bg' in content and 'background' in content:
                    print(content[:500])
                    print("=========")
            except:
                pass
