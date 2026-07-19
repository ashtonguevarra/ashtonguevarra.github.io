import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = '/app';
const NM = `${ROOT}/node_modules`;

function readJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf-8')); } catch { return null; }
}

// Read root package.json
const rootPkg = readJson(`${ROOT}/package.json`);
if (!rootPkg) { console.error('No package.json'); process.exit(1); }

// Build lockfile structure
const packages = { '': { name: rootPkg.name, version: '0.0.0', dependencies: {}, devDependencies: {} }};

// Parse root deps
for (const [k, v] of Object.entries(rootPkg.dependencies || {})) {
  packages[''].dependencies[k] = v;
}
for (const [k, v] of Object.entries(rootPkg.devDependencies || {})) {
  packages[''].devDependencies[k] = v;
}

// Scan all installed packages
function scanDir(dir, prefix = '') {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    const fullPath = `${dir}/${entry}`;
    const pkgPath = `${fullPath}/package.json`;
    if (!existsSync(pkgPath)) continue;
    const pkg = readJson(pkgPath);
    if (!pkg) continue;
    
    const key = prefix ? `${prefix}/${entry}` : entry;
    const entry2 = { version: pkg.version, resolved: `https://registry.npmjs.org/${key}/-/`, license: pkg.license };
    
    if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
      entry2.dependencies = {};
      for (const [d, v] of Object.entries(pkg.dependencies)) {
        entry2.dependencies[d] = v;
      }
    }
    if (pkg.devDependencies && Object.keys(pkg.devDependencies).length > 0) {
      // Don't include devDependencies of nested packages
    }
    if (pkg.peerDependencies && Object.keys(pkg.peerDependencies).length > 0) {
      entry2.peerDependencies = {};
      for (const [d, v] of Object.entries(pkg.peerDependencies)) {
        entry2.peerDependencies[d] = v;
      }
    }
    if (pkg.optionalDependencies && Object.keys(pkg.optionalDependencies).length > 0) {
      entry2.optionalDependencies = {};
      for (const [d, v] of Object.entries(pkg.optionalDependencies)) {
        entry2.optionalDependencies[d] = v;
      }
    }
    if (pkg.bin) {
      entry2.bin = pkg.bin;
    }
    
    packages[key.startsWith('@') ? key : `node_modules/${key}`] = entry2;
  }
}

// Scan scoped packages
for (const entry of readdirSync(NM)) {
  if (entry === '.bin' || entry === '.package-lock.json') continue;
  if (entry.startsWith('@')) {
    scanDir(`${NM}/${entry}`, `node_modules/${entry}`);
  } else {
    scanDir(NM, 'node_modules');
  }
}

// Build lockfile
const lockfile = {
  name: rootPkg.name,
  lockfileVersion: 3,
  requires: true,
  packages: packages
};

writeFileSync(`${ROOT}/package-lock.json`, JSON.stringify(lockfile, null, 2));
console.log(`Generated package-lock.json with ${Object.keys(packages).length} entries`);