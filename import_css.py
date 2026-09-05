import re
with open(r'C:\Users\pn466\OneDrive\Documents\VigilOS\frontend\src\components\hud\VigilosHud.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = 'import "./hud.css";\n' + content

with open(r'C:\Users\pn466\OneDrive\Documents\VigilOS\frontend\src\components\hud\VigilosHud.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
