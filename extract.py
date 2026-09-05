import json
import os

log_path = r'C:\Users\pn466\.gemini\antigravity\brain\994c9320-8a29-46ae-8191-8c74ed5fea52\.system_generated\logs\transcript_full.jsonl'
output_path = r'C:\Users\pn466\OneDrive\Documents\VigilOS\frontend\src\index.css.backup'

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'File Path: ile:///C:/Users/pn466/OneDrive/Documents/VigilOS/frontend/src/index.css' in line and 'Total Lines: 183' in line:
            try:
                data = json.loads(line)
                content = data.get('content', '')
                if '1: @import "tailwindcss"' in content:
                    lines = content.split('\n')
                    with open(output_path, 'w', encoding='utf-8') as out:
                        for l in lines:
                            if ':' in l and l.split(':')[0].isdigit():
                                out.write(l.split(':', 1)[1][1:] + '\n')
                    print(f"Restored to {output_path}")
                    break
            except Exception as e:
                print(e)
