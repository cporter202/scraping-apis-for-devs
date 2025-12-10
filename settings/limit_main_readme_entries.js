/**
 * Script to limit API entries in the main README.md to 250 per category
 */

const fs = require('fs');
const path = require('path');

const MAX_APIS_PER_CATEGORY = 250;

function main() {
    const readmePath = path.join(__dirname, '..', 'README.md');
    let content = fs.readFileSync(readmePath, 'utf-8');
    const lines = content.split('\n');
    
    const filteredLines = [];
    let inCategorySection = false;
    let currentCategory = '';
    let apiCount = 0;
    let skipCategory = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Detect category section start
        if (line.match(/^<a id="[^"]+"><\/a>$/)) {
            inCategorySection = true;
            apiCount = 0;
            skipCategory = false;
            filteredLines.push(line);
            continue;
        }
        
        if (line.match(/^## [^#]/)) {
            // New category or end of category section
            const categoryMatch = line.match(/^## (.+)$/);
            if (categoryMatch) {
                currentCategory = categoryMatch[1];
                apiCount = 0;
                skipCategory = false;
            }
            filteredLines.push(line);
            continue;
        }
        
        // Keep header lines, links, separators
        if (line.includes('Back to') || 
            line.includes('APIs in this category') ||
            line.includes('View all →') ||
            line.trim() === '' ||
            line.startsWith('---') ||
            line.startsWith('<p') ||
            line.startsWith('</p>') ||
            line.includes('| API Name |') ||
            line.includes('|----------|')) {
            filteredLines.push(line);
            continue;
        }
        
        // Process API table rows
        if (inCategorySection && line.includes('|') && line.includes('https://apify.com')) {
            if (apiCount < MAX_APIS_PER_CATEGORY) {
                filteredLines.push(line);
                apiCount++;
            }
            // Skip entries beyond the limit
        } else {
            // Keep all other lines
            filteredLines.push(line);
        }
        
        // Detect end of category section (empty line followed by anchor or new category)
        if (line.trim() === '' && i + 1 < lines.length) {
            const nextLine = lines[i + 1];
            if (nextLine.match(/^<a id="[^"]+"><\/a>$/) || nextLine.match(/^## [^#]/)) {
                inCategorySection = false;
            }
        }
    }
    
    content = filteredLines.join('\n');
    fs.writeFileSync(readmePath, content, 'utf-8');
    
    console.log('✅ Main README.md API entries limited to 250 per category!');
}

main();

