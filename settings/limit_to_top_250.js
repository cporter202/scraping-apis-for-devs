/**
 * Script to limit each category README to top 250 APIs maximum
 */

const fs = require('fs');
const path = require('path');

const MAX_APIS_PER_CATEGORY = 250;

// Category directories
const directories = [
    'agents-apis-697',
    'ai-apis-1208',
    'automation-apis-4825',
    'developer-tools-apis-2652',
    'ecommerce-apis-2440',
    'integrations-apis-890',
    'jobs-apis-848',
    'lead-generation-apis-3452',
    'mcp-servers-apis-131',
    'news-apis-590',
    'open-source-apis-768',
    'other-apis-1297',
    'real-estate-apis-851',
    'seo-tools-apis-710',
    'social-media-apis-3268',
    'travel-apis-397',
    'videos-apis-979'
];

// Function to limit a README file to top N APIs
function limitReadme(readmePath, maxAPIs) {
    console.log(`Processing: ${readmePath}`);
    
    const content = fs.readFileSync(readmePath, 'utf-8');
    const lines = content.split('\n');
    
    const filteredLines = [];
    let inTable = false;
    let apiCount = 0;
    let headerCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Keep header lines (title, back link, etc.)
        if (line.startsWith('#') || 
            line.includes('Back to') || 
            line.includes('Organized APIs') ||
            line.includes('APIs in this category') ||
            line.trim() === '' ||
            line.startsWith('---') ||
            line.startsWith('<p') ||
            line.startsWith('</p>')) {
            filteredLines.push(line);
            continue;
        }
        
        // Detect table start
        if (line.includes('| API Name |') || line.includes('|----------|')) {
            inTable = true;
            headerCount++;
            filteredLines.push(line);
            continue;
        }
        
        // Process table rows
        if (inTable && line.includes('|')) {
            // Check if this is a table row (has at least 2 pipes and contains a link)
            const pipeCount = (line.match(/\|/g) || []).length;
            if (pipeCount >= 2 && line.includes('https://apify.com')) {
                if (apiCount < maxAPIs) {
                    filteredLines.push(line);
                    apiCount++;
                }
                // Skip entries beyond the limit
            } else {
                // End of table or separator line
                filteredLines.push(line);
                if (line.trim() === '' || line.startsWith('---')) {
                    inTable = false;
                }
            }
        } else {
            // Non-table content - keep it
            filteredLines.push(line);
        }
    }
    
    // Update the API count in the file
    let updatedContent = filteredLines.join('\n');
    
    // Update the count line if it exists
    const countMatch = updatedContent.match(/\*\*(\d+(?:,\d+)*) APIs in this category\*\*/);
    if (countMatch) {
        const newCount = Math.min(apiCount, maxAPIs).toLocaleString();
        updatedContent = updatedContent.replace(
            /\*\*(\d+(?:,\d+)*) APIs in this category\*\*/,
            `**${newCount} APIs in this category**`
        );
    }
    
    // Write the filtered content
    fs.writeFileSync(readmePath, updatedContent, 'utf-8');
    
    console.log(`  ✓ Kept: ${apiCount} APIs (limit: ${maxAPIs})`);
    
    return apiCount;
}

// Main function
function main() {
    const rootDir = path.join(__dirname, '..');
    
    const categoryCounts = {};
    let totalAPIs = 0;
    
    console.log(`Limiting each category to top ${MAX_APIS_PER_CATEGORY} APIs...\n`);
    
    for (const dir of directories) {
        const readmePath = path.join(rootDir, dir, 'README.md');
        if (fs.existsSync(readmePath)) {
            const count = limitReadme(readmePath, MAX_APIS_PER_CATEGORY);
            categoryCounts[dir] = count;
            totalAPIs += count;
        } else {
            console.log(`⚠️  README not found: ${readmePath}`);
        }
    }
    
    console.log(`\n✅ Limiting complete!`);
    console.log(`   Total APIs: ${totalAPIs.toLocaleString()}`);
    console.log(`   Categories: ${Object.keys(categoryCounts).length}`);
    
    // Return counts for updating main README
    return { categoryCounts, totalAPIs };
}

if (require.main === module) {
    const result = main();
    
    // Save counts to a file for the update script
    const countsPath = path.join(__dirname, 'category_counts.json');
    fs.writeFileSync(countsPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`\n📊 Category counts saved to: ${countsPath}`);
}

module.exports = { limitReadme, main };

