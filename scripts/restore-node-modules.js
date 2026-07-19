const { execSync } = require('child_process');
const { existsSync, readdirSync } = require('fs');
const path = require('path');

const NM = '/app/node_modules';

// If node_modules already has packages, skip
if (existsSync(NM)) {
  const entries = readdirSync(NM).filter(e => e !== '.bin' && !e.startsWith('.'));
  if (entries.length > 10) {
    console.log('node_modules already populated, skipping restore');
    process.exit(0);
  }
}

console.log('Restoring node_modules from tarball...');
try {
  execSync('tar xzf /app/node_modules.tar.gz -C /app', { stdio: 'pipe', timeout: 30000 });
  console.log('node_modules restored successfully');
} catch (e) {
  console.error('Failed to restore node_modules:', e.message);
  // Don't fail - npm install will run normally
}