import { execSync } from 'child_process';
import { mkdirSync, existsSync, readFileSync, renameSync, rmSync, readdirSync, symlinkSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = '/app';
const NM = `${ROOT}/node_modules`;

if (!existsSync(NM)) mkdirSync(NM, { recursive: true });

const installed = new Set();

function readJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf-8')); } catch { return null; }
}

function installPackage(name, version) {
  if (installed.has(name)) return;
  installed.add(name);

  const scopeDir = name.startsWith('@') ? name.split('/')[0] : '';
  const localName = name.startsWith('@') ? name.split('/')[1] : name;
  const packName = name.replace('/', '-').replace('@', '');
  const targetDir = `${NM}/${name}`;

  if (existsSync(targetDir)) {
    const pkg = readJson(`${targetDir}/package.json`);
    if (pkg) return; // Already installed
  }

  console.log(`Installing ${name}...`);
  const tmpDir = `/tmp/pkg-${packName}`;
  if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true });
  mkdirSync(tmpDir, { recursive: true });

  try {
    const tag = version ? `${name}@${version}` : name;
    execSync(`cd "${tmpDir}" && npm pack "${tag}" 2>/dev/null`, { stdio: 'pipe', timeout: 30000 });
  } catch (e) {
    console.error(`  Failed to pack ${name}: ${e.message}`);
    return;
  }

  const files = readdirSync(tmpDir).filter(f => f.endsWith('.tgz'));
  if (files.length === 0) {
    console.error(`  No tgz found for ${name}`);
    return;
  }

  try {
    execSync(`tar -xzf "${tmpDir}/${files[0]}" -C "${tmpDir}"`, { stdio: 'pipe' });
    if (existsSync(targetDir)) rmSync(targetDir, { recursive: true });
    if (scopeDir && !existsSync(`${NM}/${scopeDir}`)) {
      mkdirSync(`${NM}/${scopeDir}`, { recursive: true });
    }
    renameSync(`${tmpDir}/package`, targetDir);
    console.log(`  ✓ ${name} installed`);
  } catch (e) {
    console.error(`  Failed to extract ${name}: ${e.message}`);
    return;
  } finally {
    rmSync(tmpDir, { recursive: true });
  }

  // Install transitive dependencies
  const pkg = readJson(`${targetDir}/package.json`);
  if (pkg) {
    const allDeps = { ...pkg.dependencies, ...pkg.peerDependencies };
    for (const [depName, depVer] of Object.entries(allDeps)) {
      if (depName === name) continue; // skip self
      const cleanVer = depVer.replace(/^[\^~]/, '');
      installPackage(depName, depVer);
    }
  }
}

// Read root package.json
const rootPkg = readJson(`${ROOT}/package.json`);
if (!rootPkg) {
  console.error('No package.json found');
  process.exit(1);
}

const allDeps = { ...rootPkg.dependencies, ...rootPkg.devDependencies };

// Install any needed peer deps for react-router-dom
installPackage('scheduler', '^0.23.2');

// Install all packages
for (const [name, version] of Object.entries(allDeps)) {
  installPackage(name, version);
}

// Create .bin symlinks
const binDir = `${NM}/.bin`;
if (!existsSync(binDir)) mkdirSync(binDir, { recursive: true });

// Find binaries
for (const dir of readdirSync(NM)) {
  const fullPath = `${NM}/${dir}`;
  if (dir.startsWith('@')) {
    for (const sub of readdirSync(fullPath)) {
      const pkgPath = `${fullPath}/${sub}`;
      const pkg = readJson(`${pkgPath}/package.json`);
      if (pkg && pkg.bin) {
        for (const [binName, binPath] of Object.entries(pkg.bin)) {
          const target = `${pkgPath}/${binPath}`;
          const linkPath = `${binDir}/${binName}`;
          try { symlinkSync(target, linkPath); } catch {}
        }
      }
    }
  } else {
    const pkgPath = `${NM}/${dir}`;
    const pkg = readJson(`${pkgPath}/package.json`);
    if (pkg && pkg.bin) {
      for (const [binName, binPath] of Object.entries(pkg.bin)) {
        const target = `${pkgPath}/${binPath}`;
        const linkPath = `${binDir}/${binName}`;
        try { symlinkSync(target, linkPath); } catch {}
      }
    }
  }
}

console.log('\nAll packages installed!');
console.log(`Total packages: ${installed.size}`);