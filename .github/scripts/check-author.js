const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const IGNORED_DIRS = new Set(['.git', '.github', 'node_modules', 'dist', 'build', '.vscode', '.idea']);

function getMinigameDirectories(baseDir) {
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  const gameDirs = [];

  for (const entry of entries) {
    if (entry.isDirectory() && !IGNORED_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
      const fullPath = path.join(baseDir, entry.name);
      const hasIndexHtml = fs.existsSync(path.join(fullPath, 'index.html'));
      if (hasIndexHtml) {
        gameDirs.push({ name: entry.name, fullPath });
      }
    }
  }

  return gameDirs;
}

function checkMinigames() {
  console.log('🔍 Checking minigame directories for AUTHOR.MD...\n');
  const gameDirs = getMinigameDirectories(ROOT_DIR);

  if (gameDirs.length === 0) {
    console.log('ℹ️ No minigame directories found.');
    process.exit(0);
  }

  let hasError = false;
  const passed = [];
  const failed = [];

  for (const { name, fullPath } of gameDirs) {
    const authorMdUpper = path.join(fullPath, 'AUTHOR.MD');
    const authorMdLower = path.join(fullPath, 'AUTHOR.md');
    const authorMdMixed = path.join(fullPath, 'Author.md');

    let authorFile = null;
    if (fs.existsSync(authorMdUpper)) authorFile = authorMdUpper;
    else if (fs.existsSync(authorMdLower)) authorFile = authorMdLower;
    else if (fs.existsSync(authorMdMixed)) authorFile = authorMdMixed;

    if (!authorFile) {
      hasError = true;
      failed.push({
        name,
        reason: 'Missing AUTHOR.MD file',
      });
    } else {
      const content = fs.readFileSync(authorFile, 'utf8').trim();
      if (content.length === 0) {
        hasError = true;
        failed.push({
          name,
          reason: 'AUTHOR.MD is empty',
        });
      } else {
        passed.push(name);
      }
    }
  }

  if (passed.length > 0) {
    console.log('✅ Passed:');
    passed.forEach((g) => console.log(`   - ${g} (AUTHOR.MD found)`));
    console.log('');
  }

  if (hasError) {
    console.error('❌ Check Failed! The following minigames are missing or have invalid AUTHOR.MD:');
    failed.forEach((f) => console.error(`   - ${f.name}: ${f.reason}`));
    console.error('\n👉 Please create an AUTHOR.MD in each minigame folder with format:');
    console.error('   - FullName: <Your Name>');
    console.error('   - Github: <Your Github Username>');
    console.error('   - Email: <Your Email>');
    console.error('   - ProjectName: <Minigame Name>\n');
    process.exit(1);
  }

  console.log('🎉 All minigames passed AUTHOR.MD precheck successfully!\n');
}

checkMinigames();
