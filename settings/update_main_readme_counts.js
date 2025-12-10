/**
 * Script to update the main README.md with new category counts
 */

const fs = require('fs');
const path = require('path');

// Category counts from the limiting script
const categoryCounts = {
    'agents-apis-697': 250,
    'ai-apis-1208': 250,
    'automation-apis-4825': 250,
    'developer-tools-apis-2652': 250,
    'ecommerce-apis-2440': 250,
    'integrations-apis-890': 250,
    'jobs-apis-848': 250,
    'lead-generation-apis-3452': 250,
    'mcp-servers-apis-131': 49,
    'news-apis-590': 250,
    'open-source-apis-768': 250,
    'other-apis-1297': 250,
    'real-estate-apis-851': 250,
    'seo-tools-apis-710': 250,
    'social-media-apis-3268': 250,
    'travel-apis-397': 250,
    'videos-apis-979': 250
};

const categoryNames = {
    'agents-apis-697': 'Agents',
    'ai-apis-1208': 'AI',
    'automation-apis-4825': 'Automation',
    'developer-tools-apis-2652': 'Developer Tools',
    'ecommerce-apis-2440': 'Ecommerce',
    'integrations-apis-890': 'Integrations',
    'jobs-apis-848': 'Jobs',
    'lead-generation-apis-3452': 'Lead Generation',
    'mcp-servers-apis-131': 'MCP Servers',
    'news-apis-590': 'News',
    'open-source-apis-768': 'Open Source',
    'other-apis-1297': 'Other',
    'real-estate-apis-851': 'Real Estate',
    'seo-tools-apis-710': 'SEO Tools',
    'social-media-apis-3268': 'Social Media',
    'travel-apis-397': 'Travel',
    'videos-apis-979': 'Videos'
};

const totalAPIs = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
const totalCategories = Object.keys(categoryCounts).length;

function main() {
    const readmePath = path.join(__dirname, '..', 'README.md');
    let content = fs.readFileSync(readmePath, 'utf-8');
    
    // Update description
    content = content.replace(
        /\*\*The most comprehensive collection of scraping APIs on GitHub\*\* - \d+(?:,\d+)* ready-to-use scraping APIs/g,
        `**The most comprehensive collection of scraping APIs on GitHub** - ${totalAPIs.toLocaleString()} ready-to-use scraping APIs`
    );
    
    // Update badges
    content = content.replace(
        /<img src="https:\/\/img\.shields\.io\/badge\/APIs-\d+(?:,\d+)*-blue/g,
        `<img src="https://img.shields.io/badge/APIs-${totalAPIs.toLocaleString()}-blue`
    );
    
    // Update statistics table
    content = content.replace(
        /\|\s*\*\*Total APIs\*\*\s*\|\s*\*\*\d+(?:,\d+)*\*\*\s*\|/,
        `| **Total APIs** | **${totalAPIs.toLocaleString()}** |`
    );
    
    // Update "What Can You Build" section
    content = content.replace(
        /This collection contains \*\*\d+(?:,\d+)* ready-to-use scraping APIs\*\*/g,
        `This collection contains **${totalAPIs.toLocaleString()} ready-to-use scraping APIs**`
    );
    
    // Update table of contents
    const tocStart = content.indexOf('## 📚 Table of Contents');
    const tocEnd = content.indexOf('---', tocStart + 1);
    
    if (tocStart !== -1 && tocEnd !== -1) {
        let newTOC = '## 📚 Table of Contents\n\n';
        
        // Sort categories by name
        const sortedCategories = Object.keys(categoryCounts).sort((a, b) => 
            categoryNames[a].localeCompare(categoryNames[b])
        );
        
        for (const dir of sortedCategories) {
            const name = categoryNames[dir];
            const count = categoryCounts[dir];
            newTOC += `- [${name}](./${dir}/) - ${count.toLocaleString()} APIs\n`;
        }
        
        newTOC += '\n---\n\n';
        
        content = content.substring(0, tocStart) + newTOC + content.substring(tocEnd);
    }
    
    // Update category counts in the main content sections
    for (const [dir, count] of Object.entries(categoryCounts)) {
        const name = categoryNames[dir];
        
        // Update count in category header (format: **XXX APIs in this category** | [View all →])
        const regex1 = new RegExp(`(\\*\\*${name}[^|]*\\| [^\\n]*\\*\\*)\\d+(?:,\\d+)*( APIs in this category\\*\\*)`, 'g');
        content = content.replace(regex1, `$1${count.toLocaleString()}$2`);
        
        // Update standalone count lines
        const regex2 = new RegExp(`(## ${name}[\\s\\S]*?\\*\\*)\\d+(?:,\\d+)*( APIs in this category\\*\\*)`, 'g');
        content = content.replace(regex2, `$1${count.toLocaleString()}$2`);
    }
    
    // Also need to limit the API entries in the main README to match the category limits
    // This is more complex - we'll need to filter each category section
    
    // Write updated content
    fs.writeFileSync(readmePath, content, 'utf-8');
    
    console.log('✅ Main README.md updated successfully!');
    console.log(`   Total APIs: ${totalAPIs.toLocaleString()}`);
    console.log(`   Categories: ${totalCategories}`);
    console.log(`   Max per category: 250`);
}

main();

