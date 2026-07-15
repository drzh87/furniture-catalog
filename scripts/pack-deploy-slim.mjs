import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const SKIP = new Set([
  'package-lock.json',
  'deploy-payload.json',
  'deploy-payload-slim.json',
  'deploy-request.json',
  'FILE_PLAN.md',
]);

const files = execSync('git ls-files', { cwd: root, encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean)
  .filter((f) => !f.includes('src/app/fonts/'))
  .filter((f) => !f.startsWith('scripts/'))
  .filter((f) => f !== 'src/app/favicon.ico')
  .filter((f) => !SKIP.has(f));

const payload = files.map((rel) => {
  const abs = path.join(root, rel);
  const isBinary = /\.(png|ico|jpg|jpeg|webp)$/i.test(rel);
  if (isBinary) {
    return { file: rel.replace(/\\/g, '/'), data: fs.readFileSync(abs).toString('base64'), encoding: 'base64' };
  }
  return { file: rel.replace(/\\/g, '/'), data: fs.readFileSync(abs, 'utf8') };
});

const out = path.join(root, 'deploy-payload-slim.json');
fs.writeFileSync(out, JSON.stringify(payload));
console.log(`${payload.length} files, ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
