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
  const encodedName = pkgName.replace('/', '%2f');
  const tarballName = pkgName.includes('/') 
    ? pkgName.split('/')[1] + '-' + version + '.tgz'
    : pkgName + '-' + version + '.tgz';
  return `https://registry.npmjs.org/${encodedName}/-/${tarballName}`;
}

// Known optional / platform-specific packages to skip
const OPTIONAL_PACKAGES = new Set([
  // esbuild platform binaries
  '@esbuild/aix-ppc64', '@esbuild/android-arm', '@esbuild/android-arm64', 
  '@esbuild/android-x64', '@esbuild/darwin-arm64', '@esbuild/darwin-x64',
  '@esbuild/freebsd-arm64', '@esbuild/freebsd-x64', '@esbuild/haiku',
  '@esbuild/linux-arm', '@esbuild/linux-arm64', '@esbuild/linux-ia32',
  '@esbuild/linux-loong64', '@esbuild/linux-mips64el', '@esbuild/linux-ppc64',
  '@esbuild/linux-riscv64', '@esbuild/linux-s390x', '@esbuild/netbsd-x64',
  '@esbuild/openbsd-x64', '@esbuild/sunos-x64', '@esbuild/win32-arm64',
  '@esbuild/win32-ia32', '@esbuild/win32-x64',
  // lightningcss platform binaries
  'lightningcss-darwin-x64', 'lightningcss-win32-x64-msvc', 'lightningcss-win32-arm64-msvc',
  'lightningcss-darwin-arm64', 'lightningcss-linux-arm64-gnu', 'lightningcss-linux-arm-gnueabihf',
  'lightningcss-linux-arm64-musl', 'lightningcss-linux-x64-musl', 'lightningcss-freebsd-x64',
  'lightningcss-android-arm64',
  // rollup platform binaries
  '@rollup/rollup-darwin-arm64', '@rollup/rollup-android-arm64',
  '@rollup/rollup-win32-arm64-msvc', '@rollup/rollup-freebsd-arm64',
  '@rollup/rollup-linux-arm64-gnu', '@rollup/rollup-linux-arm64-musl',
  '@rollup/rollup-android-arm-eabi', '@rollup/rollup-linux-arm-gnueabihf',
  '@rollup/rollup-linux-arm-musleabihf', '@rollup/rollup-win32-ia32-msvc',
  '@rollup/rollup-linux-loong64-gnu', '@rollup/rollup-linux-loong64-musl',
  '@rollup/rollup-linux-riscv64-gnu', '@rollup/rollup-linux-riscv64-musl',
  '@rollup/rollup-linux-ppc64-gnu', '@rollup/rollup-linux-ppc64-musl',
  '@rollup/rollup-linux-s390x-gnu', '@rollup/rollup-darwin-x64',
  '@rollup/rollup-win32-x64-gnu', '@rollup/rollup-win32-x64-msvc',
  '@rollup/rollup-freebsd-x64', '@rollup/rollup-linux-x64-musl',
  '@rollup/rollup-openbsd-x64', '@rollup/rollup-openharmony-arm64',
  // sass-embedded platform binaries
  'sass-embedded-all-unknown', 'sass-embedded-android-arm', 'sass-embedded-android-arm64',
  'sass-embedded-android-riscv64', 'sass-embedded-android-x64', 'sass-embedded-darwin-arm64',
  'sass-embedded-darwin-x64', 'sass-embedded-linux-arm', 'sass-embedded-linux-arm64',
  'sass-embedded-linux-musl-arm', 'sass-embedded-linux-musl-arm64', 'sass-embedded-linux-musl-riscv64',
  'sass-embedded-linux-musl-x64', 'sass-embedded-linux-riscv64', 'sass-embedded-linux-x64',
  'sass-embedded-unknown-all', 'sass-embedded-win32-arm64', 'sass-embedded-win32-x64',
  // @types packages (dev, not needed for runtime)
  '@types/node', '@types/babel__core', '@types/estree', '@types/estree',
  // fsevents (macOS only)
  'fsevents',
  // Other platform-specific
  '@img/sharp-linux-x64', '@img/sharp-libvips-linux-x64',
]);

// Helper to process a package directory
function addPackage(pkgDir, lockKey) {
  const pkgName = lockKey.replace('node_modules/', '');
  
  // Skip optional/platform-specific packages
  if (OPTIONAL_PACKAGES.has(pkgName)) {
    // Still add it but as an optional dependency reference with no resolved entry
    return;
  }
  
  const pkgPath = `${pkgDir}/package.json`;
  if (!existsSync(pkgPath)) return;
  const pkg = readJson(pkgPath);
  if (!pkg) return;
  
  const entry = { 
    version: pkg.version,
    resolved: getResolvedUrl(pkgName, pkg.version),
    license: pkg.license || undefined
  };
  
  // Only include non-optional dependencies
  if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
    // Filter out optional deps
    const filtered = {};
    for (const [depName, depVer] of Object.entries(pkg.dependencies)) {
      if (!OPTIONAL_PACKAGES.has(depName)) {
        filtered[depName] = depVer;
      }
    }
    if (Object.keys(filtered).length > 0) {
      entry.dependencies = filtered;
    }
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