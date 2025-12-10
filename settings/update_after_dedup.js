/**
 * Script to update main README and folder names after deduplication
 */

const fs = require('fs');
const path = require('path');

// Updated category counts after deduplication
const categoryCounts = {
    'agents-apis-250': 250,
    'ai-apis-250': 173,
    'automation-apis-250': 218,
    'developer-tools-apis-250': 172,
    'ecommerce-apis-250': 147,
    'integrations-apis-250': 191,
    'jobs-apis-250': 167,
    'lead-generation-apis-250': 80,
    'mcp-servers-apis-49': 28,
    'news-apis-250': 198,
    'open-source-apis-250': 216,
    'other-apis-250': 133,
    'real-estate-apis-250': 130,
    'seo-tools-apis-250': 159,
    'social-media-apis-250': 73,
    'travel-apis-250': 139,
    'videos-apis-250': 148
};

const categoryNames = {
    'agents-apis-250': 'Agents',
    'ai-apis-250': 'AI',
    'automation-apis-250': 'Automation',
    'developer-tools-apis-250': 'Developer Tools',
    'ecommerce-apis-250': 'Ecommerce',
    'integrations-apis-250': 'Integrations',
    'jobs-apis-250': 'Jobs',
    'lead-generation-apis-250': 'Lead Generation',
    'mcp-servers-apis-49': 'MCP Servers',
    'news-apis-250': 'News',
    'open-source-apis-250': 'Open Source',
    'other-apis-250': 'Other',
    'real-estate-apis-250': 'Real Estate',
    'seo-tools-apis-250': 'SEO Tools',
    'social-media-apis-250': 'Social Media',
    'travel-apis-250': 'Travel',
    'videos-apis-250': 'Videos'
};

const totalAPIs = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);

// Mapping of old folder names to new folder names
const folderRenames = {
    'ai-apis-250': 'ai-apis-173',
    'automation-apis-250': 'automation-apis-218',
    'developer-tools-apis-250': 'developer-tools-apis-172',
    'ecommerce-apis-250': 'ecommerce-apis-147',
    'integrations-apis-250': 'integrations-apis-191',
    'jobs-apis-250': 'jobs-apis-167',
    'lead-generation-apis-250': 'lead-generation-apis-80',
    'mcp-servers-apis-49': 'mcp-servers-apis-28',
    'news-apis-250': 'news-apis-198',
    'open-source-apis-250': 'open-source-apis-216',
    'other-apis-250': 'other-apis-133',
    'real-estate-apis-250': 'real-estate-apis-130',
    'seo-tools-apis-250': 'seo-tools-apis-159',
    'social-media-apis-250': 'social-media-apis-73',
    'travel-apis-250': 'travel-apis-139',
    'videos-apis-250': 'videos-apis-148'
};

function renameFolders() {
    const rootDir = path.join(__dirname, '..');
    
    console.log('Renaming folders to reflect updated API counts...\n');
    
    for (const [oldName, newName] of Object.entries(folderRenames)) {
        const oldPath = path.join(rootDir, oldName);
        const newPath = path.join(rootDir, newName);
        
        if (fs.existsSync(oldPath)) {
            try {
                fs.renameSync(oldPath, newPath);
                console.log(`✓ Renamed: ${oldName} → ${newName}`);
            } catch (error) {
                console.error(`✗ Error renaming ${oldName}: ${error.message}`);
            }
        } else {
            console.log(`⚠️  Folder not found: ${oldName}`);
        }
    }
    
    console.log('\n✅ Folder renaming complete!');
}

function updateMainReadme() {
    const rootDir = path.join(__dirname, '..');
    const readmePath = path.join(rootDir, 'README.md');
    
    console.log('\nUpdating main README.md...');
    
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
            // Use new folder name if it was renamed
            const folderName = folderRenames[dir] || dir;
            newTOC += `- [${name}](./${folderName}/) - ${count.toLocaleString()} APIs\n`;
        }
        
        newTOC += '\n---\n\n';
        
        content = content.substring(0, tocStart) + newTOC + content.substring(tocEnd);
    }
    
    // Update folder references in category sections
    for (const [oldName, newName] of Object.entries(folderRenames)) {
        const oldPattern = new RegExp(`\\./${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`, 'g');
        content = content.replace(oldPattern, `./${newName}/`);
    }
    
    // Update category counts in the main content sections
    for (const [dir, count] of Object.entries(categoryCounts)) {
        const name = categoryNames[dir];
        const folderName = folderRenames[dir] || dir;
        
        // Update count in category header
        const regex1 = new RegExp(`(\\*\\*${name}[^|]*\\| [^\\n]*\\*\\*)\\d+(?:,\\d+)*( APIs in this category\\*\\*)`, 'g');
        content = content.replace(regex1, `$1${count.toLocaleString()}$2`);
        
        // Update standalone count lines
        const regex2 = new RegExp(`(## ${name}[\\s\\S]*?\\*\\*)\\d+(?:,\\d+)*( APIs in this category\\*\\*)`, 'g');
        content = content.replace(regex2, `$1${count.toLocaleString()}$2`);
    }
    
    // Write updated content
    fs.writeFileSync(readmePath, content, 'utf-8');
    
    console.log('✅ Main README.md updated!');
}

function updateCategoryReadmes() {
    const rootDir = path.join(__dirname, '..');
    
    console.log('\nUpdating category README back links...');
    
    for (const [oldName, newName] of Object.entries(folderRenames)) {
        const readmePath = path.join(rootDir, newName, 'README.md');
        
        if (fs.existsSync(readmePath)) {
            let content = fs.readFileSync(readmePath, 'utf-8');
            let updated = false;
            
            // Update back link if it references the old folder name
            if (content.includes(`../${oldName}/`)) {
                content = content.replace(new RegExp(`\\.\\./${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`, 'g'), `../${newName}/`);
                updated = true;
            }
            
            if (updated) {
                fs.writeFileSync(readmePath, content, 'utf-8');
                console.log(`  ✓ Updated: ${newName}/README.md`);
            }
        }
    }
    
    console.log('\n✅ Category READMEs updated!');
}

// Main execution
function main() {
    renameFolders();
    updateMainReadme();
    updateCategoryReadmes();
    
    console.log('\n🎉 All updates complete!');
    console.log(`   Total unique APIs: ${totalAPIs.toLocaleString()}`);
    console.log(`   Categories: ${Object.keys(categoryCounts).length}`);
}

main();

