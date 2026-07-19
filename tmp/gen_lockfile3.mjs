import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs';

const ROOT = '/app';
const NM = `${ROOT}/node_modules`;

function readJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf-8')); } catch { return null; }
}

const rootPkg = readJson(`${ROOT}/package.json`);
if (!rootPkg) { console.error('No package.json'); process.exit(1); }

const packages = {};

// Root entry
packages[''] = { 
  name: rootPkg.name, 
  version: '0.0.0', 
  dependencies: { ...(rootPkg.dependencies || {}) },
  devDependencies: { ...(rootPkg.devDependencies || {}) }
};

// Build a proper npm registry URL for a package
function getResolvedUrl(pkgName, version) {
  // For scoped packages: @scope/name -> @scope%2fname
  const encodedName = pkgName.replace('/', '%2f');
  // For tarball name: @scope/name -> name-version.tgz (scope is dropped)
  const tarballName = pkgName.includes('/') 
    ? pkgName.split('/')[1] + '-' + version + '.tgz'
    : pkgName + '-' + version + '.tgz';
  return `https://registry.npmjs.org/${encodedName}/-/${tarballName}`;
}

// Helper to process a package directory
function addPackage(pkgDir, lockKey) {
  const pkgPath = `${pkgDir}/package.json`;
  if (!existsSync(pkgPath)) return;
  const pkg = readJson(pkgPath);
  if (!pkg) return;
  
  const pkgName = lockKey.replace('node_modules/', '');
  
  const entry = { 
    version: pkg.version,
    resolved: getResolvedUrl(pkgName, pkg.version),
    license: pkg.license || undefined
  };
  
  if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
    entry.dependencies = { ...pkg.dependencies };
  }
  if (pkg.peerDependencies && Object.keys(pkg.peerDependencies).length > 0) {
    entry.peerDependencies = { ...pkg.peerDependencies };
  }
  if (pkg.optionalDependencies && Object.keys(pkg.optionalDependencies).length > 0) {
    entry.optionalDependencies = { ...pkg.optionalDependencies };
  }
  if (pkg.bin) {
    entry.bin = pkg.bin;
  }
  
  packages[lockKey] = entry;
}

// Process all packages in node_modules
if (existsSync(NM)) {
  for (const entry of readdirSync(NM)) {
    if (entry === '.bin' || entry === '.package-lock.json' || entry.startsWith('.')) continue;
    const fullPath = `${NM}/${entry}`;
    if (!statSync(fullPath).isDirectory()) continue;
    
    if (entry.startsWith('@')) {
      // Scoped package - scan subdirectories
      for (const sub of readdirSync(fullPath)) {
        const subPath = `${fullPath}/${sub}`;
        if (!statSync(subPath).isDirectory()) continue;
        addPackage(subPath, `node_modules/${entry}/${sub}`);
      }
    } else {
      addPackage(fullPath, `node_modules/${entry}`);
    }
  }
}

// Build the full lockfile
const lockfile = {
  name: rootPkg.name,
  lockfileVersion: 3,
  requires: true,
  packages: packages
};

writeFileSync(`${ROOT}/package-lock.json`, JSON.stringify(lockfile, null, 2));
console.log(`Generated package-lock.json with ${Object.keys(packages).length} packages`);