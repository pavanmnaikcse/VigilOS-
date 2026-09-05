import re
with open('C:/Users/pn466/OneDrive/Documents/VigilOS/frontend/src/index.css', 'r', encoding='utf-8') as f:
    css = f.read()

css = re.sub(r'@import "tailwindcss" source\(none\);\s*@source "../src";', '@import "tailwindcss";', css)

with open('C:/Users/pn466/OneDrive/Documents/VigilOS/frontend/src/index.css', 'w', encoding='utf-8') as f:
    f.write(css)
