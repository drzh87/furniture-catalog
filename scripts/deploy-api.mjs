import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const authPath = path.join(
  process.env.APPDATA || '',
  'com.vercel.cli/Data/auth.json',
);

const TEAM_ID = 'team_WQiBahKTsrxYu8TAv1vrIXZk';
const PROJECT_NAME = 'mebel-catalog';

function getToken() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;
  if (!fs.existsSync(authPath)) return null;
  const auth = JSON.parse(fs.readFileSync(authPath, 'utf8'));
  return auth.token || null;
}

async function api(token, method, urlPath, body) {
  const res = await fetch(`https://api.vercel.com${urlPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${urlPath} → ${res.status}: ${text.slice(0, 800)}`);
  return JSON.parse(text);
}

async function main() {
  let token = getToken();
  if (!token) {
    console.error('No Vercel token. Run: npx vercel login');
    process.exit(1);
  }

  const payloadPath = path.join(root, 'deploy-payload-slim.json');
  if (!fs.existsSync(payloadPath)) {
    console.error('Run: node scripts/pack-deploy-slim.mjs first');
    process.exit(1);
  }
  const files = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));

  let projectId;
  try {
    const created = await api(token, 'POST', `/v10/projects?teamId=${TEAM_ID}`, {
      name: PROJECT_NAME,
      framework: 'nextjs',
    });
    projectId = created.id;
    console.log('Created project', PROJECT_NAME);
  } catch {
    const list = await api(token, 'GET', `/v9/projects?teamId=${TEAM_ID}&search=${PROJECT_NAME}`);
    const existing = list.projects?.find((p) => p.name === PROJECT_NAME);
    if (!existing) throw new Error('Project not found');
    projectId = existing.id;
    console.log('Using project', PROJECT_NAME);
  }

  const deployment = await api(token, 'POST', `/v13/deployments?teamId=${TEAM_ID}`, {
    name: PROJECT_NAME,
    project: projectId,
    target: 'production',
    files: files.map((f) => ({
      file: f.file,
      data: f.data,
      encoding: f.encoding || 'utf-8',
    })),
  });

  console.log('DEPLOY_URL=https://' + (deployment.url || `${PROJECT_NAME}.vercel.app`));
  console.log('INSPECT=' + (deployment.inspectorUrl || ''));
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
