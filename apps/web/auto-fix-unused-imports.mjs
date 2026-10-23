// auto-fix-unused-imports.mjs
// Reads eslint-output.json and removes unused imports from each file

import { readFileSync, writeFileSync } from 'fs';

const raw = readFileSync('./eslint-output.json', 'utf8');

// The output file might have non-JSON content (warnings prefix), find the JSON array
const jsonStart = raw.indexOf('[');
if (jsonStart === -1) {
  console.error('No JSON array found in eslint-output.json');
  process.exit(1);
}
const results = JSON.parse(raw.slice(jsonStart));

let totalFilesFixed = 0;
let totalRemoved = 0;

for (const fileResult of results) {
  const filePath = fileResult.filePath;
  const messages = fileResult.messages || [];

  // Get all "defined but never used" or "is assigned a value but never used" for imports
  const unusedImportNames = new Set();

  for (const msg of messages) {
    if (msg.ruleId !== '@typescript-eslint/no-unused-vars') continue;
    // Match: 'FooBar' is defined but never used
    const m = msg.message.match(/'([^']+)' is defined but never used/);
    if (m) unusedImportNames.add(m[1]);
  }

  if (unusedImportNames.size === 0) continue;

  let content = readFileSync(filePath, 'utf8');
  const original = content;

  for (const name of unusedImportNames) {
    // Remove from import statements - handles:
    // 1. Named import: import { Foo, Bar } from '...'  -> remove Foo
    // 2. Named import alone: import { Foo } from '...' -> remove whole import
    // 3. Default import: import Foo from '...'         -> remove whole import

    // Regex to match named import list containing this name
    // Strategy: look for the name in import { ... } patterns and remove it
    
    // Pattern for: ,\s*Name or Name\s*, or { Name } or { Name, or Name }
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Remove from multi-import: { ..., Name, ... } or { Name, ... } or { ..., Name }
    // Handle trailing comma, leading comma, or only item
    content = content
      // ",  Name" at end of import list (before closing brace or newline)  
      .replace(new RegExp(`,\\s*\\n?\\s*${escaped}(?=\\s*[,\\n}])`, 'g'), '')
      // "Name," at start/middle of import list
      .replace(new RegExp(`(?<=\\{[^}]*)${escaped}\\s*,\\s*`, 'g'), '')
      // "Name" alone (last item): { Name }
      .replace(new RegExp(`\\{\\s*${escaped}\\s*\\}`, 'g'), '{}')
      // Exact standalone name on its own line in multi-line import
      .replace(new RegExp(`^  ${escaped},?\\r?\\n`, 'gm'), '');
    
    // Clean up empty imports: import {} from '...'
    content = content.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"]\s*;?\s*\n?/g, '');

    // Remove whole-line default imports: import Name from '...'
    content = content.replace(new RegExp(`^import\\s+${escaped}\\s+from\\s+['"][^'"]+['"]\\s*;?\\r?\\n`, 'gm'), '');

    // Remove namespace imports: import * as Name from '...'
    content = content.replace(new RegExp(`^import\\s+\\*\\s+as\\s+${escaped}\\s+from\\s+['"][^'"]+['"]\\s*;?\\r?\\n`, 'gm'), '');
  }

  // Clean up any trailing commas before closing brace in imports
  content = content.replace(/,(\s*})/g, '$1');
  // Clean up double commas
  content = content.replace(/,\s*,/g, ',');

  if (content !== original) {
    writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${unusedImportNames.size} unused imports in: ${filePath.split('\\').slice(-3).join('\\')}`);
    totalFilesFixed++;
    totalRemoved += unusedImportNames.size;
  }
}

console.log(`\n✅ Total: ${totalRemoved} unused imports removed from ${totalFilesFixed} files`);
