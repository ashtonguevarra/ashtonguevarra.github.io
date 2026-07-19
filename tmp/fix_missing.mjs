import { execSync } from 'child_process';
import { mkdirSync, existsSync, readFileSync, renameSync, rmSync, readdirSync, symlinkSync } from 'fs';

const ROOT = '/app';
const NM = `${ROOT}/node_modules`;

function readJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf-8')); } catch { return null; }
}

function findMissing() {
  const missing = new Set();
  const dirs = [];

  // Collect all dirs
  for (const dir of readdirSync(NM)) {
    if (dir === '.bin') continue;
    if (dir.startsWith('@')) {
      const subDir = `${NM}/${dir}`;
      if (!existsSync(subDir)) continue;
      for (const sub of readdirSync(subDir)) {
        dirs.push(`${subDir}/${sub}`);
      }
    } else {
      dirs.push(`${NM}/${dir}`);
    }
  }

  for (const pkgDir of dirs) {
    const pkg = readJson(`${pkgDir}/package.json`);
    if (!pkg) continue;
    const allDeps = { ...pkg.dependencies, ...pkg.peerDependencies };
    for (const depName of Object.keys(allDeps)) {
      const depPath = depName.startsWith('@') 
        ? `${NM}/${depName}`
        : `${NM}/${depName}`;
      if (!existsSync(depPath) || !readJson(`${depPath}/package.json`)) {
        missing.add(depName);
      }
    }
  }
  return [...missing];
}

function installSingle(name) {
  const scopeDir = name.startsWith('@') ? name.split('/')[0] : '';
  const packName = name.replace('/', '-').replace('@', '');
  const targetDir = `${NM}/${name}`;

  if (existsSync(targetDir)) {
    const pkg = readJson(`${targetDir}/package.json`);
    if (pkg) return false; // Already installed
  }

  const tmpDir = `/tmp/pkg-${packName}`;
  if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true });
  mkdirSync(tmpDir, { recursive: true });

  try {
    execSync(`cd "${tmpDir}" && npm pack "${name}" 2>/dev/null`, { stdio: 'pipe', timeout: 30000 });
  } catch (e) {
    console.error(`  Failed to pack ${name}: ${e.message}`);
    return false;
  }

  const files = readdirSync(tmpDir).filter(f => f.endsWith('.tgz'));
  if (files.length === 0) {
    console.error(`  No tgz found for ${name}`);
    return false;
  }

  try {
    execSync(`tar -xzf "${tmpDir}/${files[0]}" -C "${tmpDir}"`, { stdio: 'pipe' });
    if (existsSync(targetDir)) rmSync(targetDir, { recursive: true });
    if (scopeDir && !existsSync(`${NM}/${scopeDir}`)) {
      mkdirSync(`${NM}/${scopeDir}`, { recursive: true });
    }
    renameSync(`${tmpDir}/package`, targetDir);
    console.log(`  ✓ ${name}`);
    return true;
  } catch (e) {
    console.error(`  Failed to extract ${name}: ${e.message}`);
    rmSync(tmpDir, { recursive: true });
    return false;
  }
}

// Fix missing in batches
let round = 0;
let totalFixed = 0;
while (true) {
  round++;
  const missing = findMissing();
  if (missing.length === 0) {
    console.log(`\nNo missing packages!`);
    break;
  }
  console.log(`\nRound ${round}: ${missing.length} missing packages`);
  let fixed = 0;
  for (const name of missing) {
    if (installSingle(name)) {
      fixed++;
      totalFixed++;
    }
  }
  if (fixed === 0) {
    console.log(`Could not fix any more packages. Still missing: ${missing.length}`);
    break;
  }
  console.log(`Fixed ${fixed} packages this round`);
}

// Create .bin symlinks
const binDir = `${NM}/.bin`;
if (!existsSync(binDir)) mkdirSync(binDir, { recursive: true });

for (const dir of readdirSync(NM)) {
  const fullPath = `${NM}/${dir}`;
  if (dir.startsWith('@')) {
    if (!existsSync(fullPath)) continue;
    for (const sub of readdirSync(fullPath)) {
      const pkgPath = `${fullPath}/${sub}`;
      const pkg = readJson(`${pkgPath}/package.json`);
      if (pkg && pkg.bin) {
        for (const [binName, binPath] of Object.entries(pkg.bin)) {
          if (typeof binPath === 'string') {
            const target = `${pkgPath}/${binPath}`;
            const linkPath = `${binDir}/${binName}`;
            try { symlinkSync(target, linkPath); } catch {}
          }
        }
      }
    }
  } else {
    const pkgPath = `${NM}/${dir}`;
    const pkg = readJson(`${pkgPath}/package.json`);
    if (pkg && pkg.bin) {
      for (const [binName, binPath] of Object.entries(pkg.bin)) {
        if (typeof binPath === 'string') {
          const target = `${pkgPath}/${binPath}`;
          const linkPath = `${binDir}/${binName}`;
          try { symlinkSync(target, linkPath); } catch {}
        }
      }
    }
  }
}

console.log(`\nTotal fixed: ${totalFixed}`);
console.log('Done!');