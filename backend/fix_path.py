import urllib.parse
with open('app/routers/commando.py', 'r') as f:
    code = f.read()

# Add a quick URL cleanup loop before returning actions
replacement = '''        if not isinstance(actions, list):
            actions = [actions]
            
        # Clean up any case IDs in paths (e.g. /case/CASE 123 -> /case/CASE-123)
        for act in actions:
            if act.get("action") == "navigate" and "path" in act:
                act["path"] = act["path"].replace("CASE ", "CASE-")
                act["path"] = act["path"].replace("case ", "CASE-")
                act["path"] = act["path"].replace(" ", "")
                
        return actions'''

code = code.replace('''        if not isinstance(actions, list):
            actions = [actions]
        return actions''', replacement)

with open('app/routers/commando.py', 'w') as f:
    f.write(code)
