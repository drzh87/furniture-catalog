import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authPath = path.join(process.env.APPDATA || '', 'com.vercel.cli/Data/auth.json');
const root = path.join(__dirname, '..');

async function waitForToken(maxMs = 180000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    if (fs.existsSync(authPath)) {
      const auth = JSON.parse(fs.readFileSync(authPath, 'utf8'));
      if (auth.token) return auth.token;
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return null;
}

const token = await waitForToken();
if (!token) {
  console.error('Timeout waiting for Vercel login. Open the device URL shown by `npx vercel login`.');
  process.exit(1);
}

console.log('Vercel token found, deploying...');
const child = spawn('node', ['scripts/deploy-api.mjs'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, VERCEL_TOKEN: token },
});
child.on('exit', (code) => process.exit(code ?? 1));
