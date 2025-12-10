/**
 * Script to rename category folders to reflect correct API counts
 */

const fs = require('fs');
const path = require('path');

// Mapping of old folder names to new folder names based on current API counts
const folderRenames = {
    'agents-apis-697': 'agents-apis-250',
    'ai-apis-1208': 'ai-apis-250',
    'automation-apis-4825': 'automation-apis-250',
    'developer-tools-apis-2652': 'developer-tools-apis-250',
    'ecommerce-apis-2440': 'ecommerce-apis-250',
    'integrations-apis-890': 'integrations-apis-250',
    'jobs-apis-848': 'jobs-apis-250',
    'lead-generation-apis-3452': 'lead-generation-apis-250',
    'mcp-servers-apis-131': 'mcp-servers-apis-49',
    'news-apis-590': 'news-apis-250',
    'open-source-apis-768': 'open-source-apis-250',
    'other-apis-1297': 'other-apis-250',
    'real-estate-apis-851': 'real-estate-apis-250',
    'seo-tools-apis-710': 'seo-tools-apis-250',
    'social-media-apis-3268': 'social-media-apis-250',
    'travel-apis-397': 'travel-apis-250',
    'videos-apis-979': 'videos-apis-250'
};

function renameFolders() {
    const rootDir = path.join(__dirname, '..');
    
    console.log('Renaming folders to reflect correct API counts...\n');
    
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

function updateReadmeReferences() {
    const rootDir = path.join(__dirname, '..');
    const readmePath = path.join(rootDir, 'README.md');
    
    console.log('\nUpdating README.md references...');
    
    let content = fs.readFileSync(readmePath, 'utf-8');
    let updated = false;
    
    for (const [oldName, newName] of Object.entries(folderRenames)) {
        // Replace folder references in links
        const oldPattern = new RegExp(`\\./${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`, 'g');
        if (content.includes(`./${oldName}/`)) {
            content = content.replace(oldPattern, `./${newName}/`);
            updated = true;
            console.log(`  ✓ Updated references: ${oldName} → ${newName}`);
        }
    }
    
    if (updated) {
        fs.writeFileSync(readmePath, content, 'utf-8');
        console.log('\n✅ README.md updated!');
    } else {
        console.log('\n⚠️  No references found to update in README.md');
    }
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
    updateReadmeReferences();
    updateCategoryReadmes();
    
    console.log('\n🎉 All folder names and references updated successfully!');
}

main();

