with open('app/routers/commando.py', 'r') as f:
    code = f.read()

bad = '''        # Clean up any case IDs in paths (e.g. /case/CASE 123 -> /case/CASE-123)
        for act in actions:
            if act.get("action") == "navigate" and "path" in act:
                act["path"] = act["path"].replace("CASE ", "CASE-")
                act["path"] = act["path"].replace("case ", "CASE-")
                act["path"] = act["path"].replace(" ", "")'''

good = '''        # Clean up any case IDs in paths (e.g. /case/CASE 123 -> /case/CASE-123)
        for act in actions:
            if act.get("action") == "navigate" and "path" in act:
                path = act["path"]
                # Specifically fix the case ID space issue
                path = path.replace("/case/CASE ", "/case/CASE-")
                path = path.replace("/case/case ", "/case/CASE-")
                path = path.replace("/case/VIG ", "/case/VIG-")
                path = path.replace("/case/vig ", "/case/VIG-")
                
                # If there are any stray spaces before the hash, remove them
                if "#" in path:
                    base, hash_part = path.split("#", 1)
                    base = base.replace(" ", "")
                    path = base + "#" + hash_part
                else:
                    path = path.replace(" ", "")
                    
                act["path"] = path'''

code = code.replace(bad, good)

with open('app/routers/commando.py', 'w') as f:
    f.write(code)
