import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const TEAM_ID = 'team_WQiBahKTsrxYu8TAv1vrIXZk';
const PROJECT_NAME = 'mebel-catalog';

async function deployWithToken(token) {
  const files = JSON.parse(
    fs.readFileSync(path.join(root, 'deploy-payload-slim.json'), 'utf8'),
  );

  async function api(method, urlPath, body) {
    const res = await fetch(`https://api.vercel.com${urlPath}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${urlPath} → ${res.status}: ${text.slice(0, 500)}`);
    return JSON.parse(text);
  }

  let projectId;
  try {
    const created = await api('POST', `/v10/projects?teamId=${TEAM_ID}`, {
      name: PROJECT_NAME,
      framework: 'nextjs',
      gitRepository: { type: 'github', repo: 'drzh87/furniture-catalog' },
    });
    projectId = created.id;
  } catch {
    const list = await api('GET', `/v9/projects?teamId=${TEAM_ID}&search=${PROJECT_NAME}`);
    projectId = list.projects?.find((p) => p.name === PROJECT_NAME)?.id;
  }
  if (!projectId) throw new Error('No project');

  const deployment = await api('POST', `/v13/deployments?teamId=${TEAM_ID}`, {
    name: PROJECT_NAME,
    project: projectId,
    target: 'production',
    gitSource: {
      type: 'github',
      org: 'drzh87',
      repo: 'furniture-catalog',
      ref: 'main',
    },
  });

  console.log(JSON.stringify({
    url: deployment.url,
    alias: `https://${PROJECT_NAME}.vercel.app`,
    id: deployment.id,
  }));
}

// Token from: vercel login OR https://vercel.com/account/tokens
const token = process.argv[2] || process.env.VERCEL_TOKEN;
if (!token) {
  console.error('Usage: node scripts/deploy-git.mjs <VERCEL_TOKEN>');
  process.exit(1);
}

deployWithToken(token).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
