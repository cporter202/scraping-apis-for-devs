/**
 * Script to remove duplicate APIs across different category folders
 */

const fs = require('fs');
const path = require('path');

// Category directories
const directories = [
    'agents-apis-250',
    'ai-apis-250',
    'automation-apis-250',
    'developer-tools-apis-250',
    'ecommerce-apis-250',
    'integrations-apis-250',
    'jobs-apis-250',
    'lead-generation-apis-250',
    'mcp-servers-apis-49',
    'news-apis-250',
    'open-source-apis-250',
    'other-apis-250',
    'real-estate-apis-250',
    'seo-tools-apis-250',
    'social-media-apis-250',
    'travel-apis-250',
    'videos-apis-250'
];

// Extract API URL from a table row
function extractApiUrl(line) {
    const urlMatch = line.match(/https:\/\/apify\.com\/[^\s\)]+/);
    return urlMatch ? urlMatch[0] : null;
}

// Extract API name from a table row
function extractApiName(line) {
    const nameMatch = line.match(/\| \[([^\]]+)\]/);
    return nameMatch ? nameMatch[1] : null;
}

// Read all APIs from all categories
function scanAllApis() {
    const rootDir = path.join(__dirname, '..');
    const apiMap = new Map(); // url -> { name, categories: [] }
    const categoryApis = {}; // category -> [{ url, name, line }]
    
    console.log('Scanning all categories for duplicate APIs...\n');
    
    for (const dir of directories) {
        const readmePath = path.join(rootDir, dir, 'README.md');
        if (!fs.existsSync(readmePath)) {
            console.log(`⚠️  README not found: ${readmePath}`);
            continue;
        }
        
        const content = fs.readFileSync(readmePath, 'utf-8');
        const lines = content.split('\n');
        categoryApis[dir] = [];
        
        for (const line of lines) {
            if (line.includes('|') && line.includes('https://apify.com')) {
                const url = extractApiUrl(line);
                const name = extractApiName(line);
                
                if (url) {
                    if (!apiMap.has(url)) {
                        apiMap.set(url, { name, categories: [] });
                    }
                    
                    const apiInfo = apiMap.get(url);
                    apiInfo.categories.push(dir);
                    categoryApis[dir].push({ url, name, line });
                }
            }
        }
        
        console.log(`  ✓ Scanned ${dir}: ${categoryApis[dir].length} APIs`);
    }
    
    return { apiMap, categoryApis };
}

// Find duplicates
function findDuplicates(apiMap) {
    const duplicates = [];
    
    for (const [url, info] of apiMap.entries()) {
        if (info.categories.length > 1) {
            duplicates.push({
                url,
                name: info.name,
                categories: info.categories
            });
        }
    }
    
    return duplicates;
}

// Remove duplicates from categories, keeping in the first category found
function removeDuplicates(categoryApis, duplicates) {
    const rootDir = path.join(__dirname, '..');
    const urlsToRemove = new Map(); // category -> Set of URLs to remove
    
    // For each duplicate, keep it in the first category, remove from others
    for (const dup of duplicates) {
        const keepInCategory = dup.categories[0];
        const removeFromCategories = dup.categories.slice(1);
        
        for (const category of removeFromCategories) {
            if (!urlsToRemove.has(category)) {
                urlsToRemove.set(category, new Set());
            }
            urlsToRemove.get(category).add(dup.url);
        }
    }
    
    console.log('\nRemoving duplicates from categories...\n');
    
    const categoryCounts = {};
    
    for (const dir of directories) {
        const readmePath = path.join(rootDir, dir, 'README.md');
        if (!fs.existsSync(readmePath)) {
            continue;
        }
        
        const content = fs.readFileSync(readmePath, 'utf-8');
        const lines = content.split('\n');
        const filteredLines = [];
        const urlsToRemoveInCategory = urlsToRemove.get(dir) || new Set();
        let removedCount = 0;
        let keptCount = 0;
        
        for (const line of lines) {
            // Keep header lines
            if (line.startsWith('#') || 
                line.includes('Back to') || 
                line.includes('Organized APIs') ||
                line.includes('APIs in this category') ||
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
            if (line.includes('|') && line.includes('https://apify.com')) {
                const url = extractApiUrl(line);
                if (url && urlsToRemoveInCategory.has(url)) {
                    removedCount++;
                    // Skip this line (don't add it)
                } else {
                    filteredLines.push(line);
                    if (url) keptCount++;
                }
            } else {
                // Keep all other lines
                filteredLines.push(line);
            }
        }
        
        // Update the API count in the file
        let updatedContent = filteredLines.join('\n');
        const countMatch = updatedContent.match(/\*\*(\d+(?:,\d+)*) APIs in this category\*\*/);
        if (countMatch) {
            const newCount = keptCount.toLocaleString();
            updatedContent = updatedContent.replace(
                /\*\*(\d+(?:,\d+)*) APIs in this category\*\*/,
                `**${newCount} APIs in this category**`
            );
        }
        
        // Write the filtered content
        fs.writeFileSync(readmePath, updatedContent, 'utf-8');
        
        categoryCounts[dir] = keptCount;
        
        if (removedCount > 0) {
            console.log(`  ✓ ${dir}: Removed ${removedCount} duplicates, kept ${keptCount} APIs`);
        } else {
            console.log(`  ✓ ${dir}: No duplicates, kept ${keptCount} APIs`);
        }
    }
    
    return categoryCounts;
}

// Main function
function main() {
    console.log('🔍 Finding and removing duplicate APIs across categories...\n');
    
    // Step 1: Scan all APIs
    const { apiMap, categoryApis } = scanAllApis();
    
    // Step 2: Find duplicates
    const duplicates = findDuplicates(apiMap);
    
    console.log(`\n📊 Found ${duplicates.length} duplicate APIs across categories\n`);
    
    if (duplicates.length > 0) {
        // Show some examples
        console.log('Examples of duplicates:');
        for (let i = 0; i < Math.min(10, duplicates.length); i++) {
            const dup = duplicates[i];
            console.log(`  - "${dup.name}" appears in: ${dup.categories.join(', ')}`);
        }
        if (duplicates.length > 10) {
            console.log(`  ... and ${duplicates.length - 10} more`);
        }
        
        // Step 3: Remove duplicates
        const categoryCounts = removeDuplicates(categoryApis, duplicates);
        
        const totalAPIs = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
        
        console.log(`\n✅ Duplicate removal complete!`);
        console.log(`   Total unique APIs: ${totalAPIs.toLocaleString()}`);
        console.log(`   Duplicates removed: ${duplicates.length}`);
        
        return { categoryCounts, totalAPIs };
    } else {
        console.log('✅ No duplicates found!');
        return null;
    }
}

if (require.main === module) {
    const result = main();
    if (result) {
        // Save counts to a file for updating main README
        const countsPath = path.join(__dirname, 'category_counts_after_dedup.json');
        fs.writeFileSync(countsPath, JSON.stringify(result, null, 2), 'utf-8');
        console.log(`\n📊 Updated category counts saved to: ${countsPath}`);
    }
}

module.exports = { scanAllApis, findDuplicates, removeDuplicates };

