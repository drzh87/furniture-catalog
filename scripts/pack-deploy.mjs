import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const root = path.resolve('.');
const files = execSync('git ls-files', { cwd: root, encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

const payload = files.map((rel) => {
  const abs = path.join(root, rel);
  const isBinary = /\.(woff|ico|png|jpg|jpeg|webp)$/i.test(rel);
  if (isBinary) {
    const data = fs.readFileSync(abs).toString('base64');
    return { file: rel.replace(/\\/g, '/'), data, encoding: 'base64' };
  }
  const data = fs.readFileSync(abs, 'utf8');
  return { file: rel.replace(/\\/g, '/'), data };
});

fs.writeFileSync('deploy-payload.json', JSON.stringify(payload));
console.log(`Wrote ${payload.length} files, ${(fs.statSync('deploy-payload.json').size / 1024 / 1024).toFixed(2)} MB`);
