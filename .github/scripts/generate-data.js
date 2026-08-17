#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const IGNORED_DIRS = new Set(['.git', '.github', 'node_modules', 'dist', 'build', '.vscode', '.idea']);

function parseAuthorMd(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const result = {};

  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim().replace(/^[-*#]\s*/, '');
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex !== -1) {
      const key = trimmed.slice(0, colonIndex).trim().toLowerCase();
      const val = trimmed.slice(colonIndex + 1).trim();
      result[key] = val;
    }
  }
  return result;
}

function extractMetaFromHtml(htmlPath) {
  if (!fs.existsSync(htmlPath)) return {};
  const content = fs.readFileSync(htmlPath, 'utf8');
  const meta = {};

  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i) ||
    content.match(/<meta\s+content=["'](.*?)["']\s+name=["']description["']/i);
  if (descMatch) meta.description = descMatch[1].trim();

  const titleMatch = content.match(/<title>(.*?)<\/title>/i);
  if (titleMatch) meta.title = titleMatch[1].trim();

  return meta;
}

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

function updateReadme(gamesList) {
  const readmePath = path.join(ROOT_DIR, 'README.md');
  if (!fs.existsSync(readmePath)) return;

  const content = fs.readFileSync(readmePath, 'utf8');
  const startTag = '<!-- START-LIST-GAME -->';
  const endTag = '<!-- END-LIST-GAME -->';

  const startIndex = content.indexOf(startTag);
  const endIndex = content.indexOf(endTag);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    console.warn('⚠️ Could not find <!-- START-LIST-GAME --> and <!-- END-LIST-GAME --> tags in README.md');
    return;
  }

  const listLines = gamesList.map((g) => {
    const authorText = g.github
      ? `[${g.author}](https://github.com/${g.github})`
      : g.author || 'MPC Team';
    return `- **${g.id}**: ${g.name} (Tác giả: ${authorText})`;
  }).join('\n');

  const newContent =
    content.slice(0, startIndex + startTag.length) +
    '\n' +
    listLines +
    '\n' +
    content.slice(endIndex);

  fs.writeFileSync(readmePath, newContent, 'utf8');
  console.log('📝 Successfully updated README.md game list!');
}

function generateDataJson() {
  console.log('🔄 Scanning minigame directories and parsing AUTHOR.MD...\n');
  const gameDirs = getMinigameDirectories(ROOT_DIR);
  const gamesList = [];

  for (const { name: dirName, fullPath } of gameDirs) {
    // 1. Locate and parse AUTHOR.MD
    const authorFiles = ['AUTHOR.MD', 'AUTHOR.md', 'Author.md', 'author.md'];
    let authorData = {};
    for (const f of authorFiles) {
      const fp = path.join(fullPath, f);
      if (fs.existsSync(fp)) {
        authorData = parseAuthorMd(fp);
        break;
      }
    }

    // 2. Extract HTML meta tags
    const htmlMeta = extractMetaFromHtml(path.join(fullPath, 'index.html'));

    // 3. Detect icon & mascot
    let iconPath = '';
    if (fs.existsSync(path.join(fullPath, 'assets/logo/logo.png'))) {
      iconPath = `${dirName}/assets/logo/logo.png`;
    }

    let mascotPath = '';
    if (fs.existsSync(path.join(fullPath, 'assets/mascot/mascot-idle.png'))) {
      mascotPath = `${dirName}/assets/mascot/mascot-idle.png`;
    }

    // 4. Format game object
    const game = {
      id: dirName,
      name: authorData.projectname || authorData.name || htmlMeta.title || dirName,
      competition: authorData.competition || dirName.toUpperCase(),
      path: `./${dirName}/`,
      icon: iconPath,
      mascot: mascotPath,
      description: authorData.description || htmlMeta.description || `Minigame ${dirName}`,
      author: authorData.fullname || authorData.author || 'CLB Lập Trình Trên Thiết Bị Di Động',
      github: authorData.github || '',
      email: authorData.email || '',
    };

    gamesList.push(game);
    console.log(`✨ Processed "${dirName}":`);
    console.log(`   - Name: ${game.name}`);
    console.log(`   - Author: ${game.author} ${game.github ? '(@' + game.github + ')' : ''}`);
    console.log(`   - Path: ${game.path}\n`);
  }

  const outputPath = path.join(ROOT_DIR, 'data.json');
  fs.writeFileSync(outputPath, JSON.stringify(gamesList, null, 2), 'utf8');
  console.log(`🎉 Successfully generated data.json with ${gamesList.length} minigames!\n`);

  updateReadme(gamesList);
}

generateDataJson();

