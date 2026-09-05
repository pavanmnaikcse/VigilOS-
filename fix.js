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
    const hudStyles = sep + lovableParts[1];
    
    // Fix @theme inline { } block for Tailwind V4
    // Tailwind V4 doesn't like empty properties or weird spacing.
    // Also, we can just remove @theme inline and use standard :root vars because they are already there!
    
    let cleaned = hudStyles.replace(/@theme inline\s*{[\s\S]*?}/g, '');
    
    content += '\n\n' + cleaned;
}

fs.writeFileSync('C:/Users/pn466/OneDrive/Documents/VigilOS/frontend/src/index.css', content);
console.log("Successfully rebuilt index.css");
