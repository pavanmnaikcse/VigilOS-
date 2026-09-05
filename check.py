with open('C:/Users/pn466/OneDrive/Documents/VigilOS/frontend/src/index.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, l in enumerate(lines):
    if '   ' in l:
        print(f"Line {i+1}: {repr(l)}")
