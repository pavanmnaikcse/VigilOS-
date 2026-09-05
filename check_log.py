import json
import re

log_path = r'C:\Users\pn466\.gemini\antigravity\brain\994c9320-8a29-46ae-8191-8c74ed5fea52\.system_generated\logs\transcript.jsonl'

with open(log_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'index.css' in line and '@theme' in line:
        try:
            data = json.loads(line)
            if 'content' in data:
                print(data['content'][:500])
        except:
            pass
