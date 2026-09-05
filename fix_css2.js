const fs = require('fs');
let content = fs.readFileSync('C:/Users/pn466/OneDrive/Documents/VigilOS/frontend/src/index.css', 'utf-8');

// Strip out everything from Lovable
const sep = '/* ============================================================';
if (content.includes(sep)) {
    content = content.split(sep)[0];
}

let lovable = fs.readFileSync('c:/Users/pn466/OneDrive/Documents/living-hud-main/living-hud-main/src/styles.css', 'utf-8');
const lovableParts = lovable.split(sep);
if (lovableParts.length > 1) {
    let hudStyles = lovableParts[1];
    
    // Remove the @theme inline and @layer base completely as it crashes Tailwind V4 
    hudStyles = hudStyles.replace(/@theme inline\s*{[\s\S]*?}/g, '');
    hudStyles = hudStyles.replace(/@layer base\s*{[\s\S]*?}/g, '');
    
    content += '\n/* HUD STYLES */\n' + hudStyles;
}

fs.writeFileSync('C:/Users/pn466/OneDrive/Documents/VigilOS/frontend/src/index.css', content);
console.log("Successfully rebuilt index.css cleanly");
