import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const files = execSync('git ls-files', { cwd: root, encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean)
  .filter((f) => !f.includes('src/app/fonts/') && f !== 'deploy-payload.json');

const payload = files.map((rel) => {
  const abs = path.join(root, rel);
  const isBinary = /\.(png|ico|jpg|jpeg|webp)$/i.test(rel);
  if (isBinary) {
    return { file: rel.replace(/\\/g, '/'), data: fs.readFileSync(abs).toString('base64'), encoding: 'base64' };
  }
  return { file: rel.replace(/\\/g, '/'), data: fs.readFileSync(abs, 'utf8') };
});

fs.writeFileSync(path.join(root, 'deploy-payload-slim.json'), JSON.stringify(payload));
console.log(`Slim payload: ${payload.length} files, ${(fs.statSync(path.join(root, 'deploy-payload-slim.json')).size / 1024).toFixed(0)} KB`);
