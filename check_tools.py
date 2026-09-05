import json
log_path = r'C:\Users\pn466\.gemini\antigravity\brain\994c9320-8a29-46ae-8191-8c74ed5fea52\.system_generated\logs\transcript_full.jsonl'

for line in open(log_path, 'r', encoding='utf-8'):
    if 'index.css' in line:
        try:
            d = json.loads(line)
            if d.get('type') == 'PLANNER_RESPONSE':
                print([tc['name'] for tc in d.get('tool_calls', [])])
        except:
            pass
