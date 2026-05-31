import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';

const zip = new AdmZip();

// Helper to recursively add folder contents
function addFolderToZip(localPath, zipPath) {
  if (!fs.existsSync(localPath)) return;
  const files = fs.readdirSync(localPath);
  for (const file of files) {
    const fullPath = path.join(localPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== '.vercel') {
        addFolderToZip(fullPath, path.join(zipPath, file));
      }
    } else {
      const content = fs.readFileSync(fullPath);
      zip.addFile(path.join(zipPath, file), content);
    }
  }
}

console.log('Generating production ZIP archive...');

// 1. Pack Frontend stuff into 'frontend/' folder inside ZIP
zip.addLocalFile('package.json', 'frontend');
if (fs.existsSync('vite.config.ts')) zip.addLocalFile('vite.config.ts', 'frontend');
if (fs.existsSync('index.html')) zip.addLocalFile('index.html', 'frontend');
if (fs.existsSync('tsconfig.json')) zip.addLocalFile('tsconfig.json', 'frontend');
if (fs.existsSync('tsconfig.app.json')) zip.addLocalFile('tsconfig.app.json', 'frontend');
if (fs.existsSync('tsconfig.node.json')) zip.addLocalFile('tsconfig.node.json', 'frontend');
addFolderToZip('src', 'frontend/src');
addFolderToZip('public', 'frontend/public');

// 2. Pack Backend stuff into 'backend/' folder inside ZIP (and in brackets/folders)
addFolderToZip('api', 'backend/api');
if (fs.existsSync('vercel.json')) zip.addLocalFile('vercel.json', 'backend');

// Ensure the output directory exists
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Save the zip file
zip.writeZip('public/chhotan-ram-construction-source.zip');
console.log('ZIP archive generated successfully at public/chhotan-ram-construction-source.zip');
