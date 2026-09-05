const fs = require('fs');
const css = fs.readFileSync('C:/Users/pn466/OneDrive/Documents/VigilOS/frontend/src/index.css', 'utf-8');
const lines = css.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('   ')) {
        console.log(Line : );
    }
}
