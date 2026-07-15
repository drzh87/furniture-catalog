#!/usr/bin/env node
/**
 * Deploy furniture-catalog to Vercel via REST API (git source).
 * Requires VERCEL_TOKEN in env — from `vercel login` or dashboard token.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEAM_ID = 'team_WQiBahKTsrxYu8TAv1vrIXZk';
const PROJECT_NAME = 'mebel-catalog';
const REPO = 'drzh87/furniture-catalog';

async function api(method, urlPath, body) {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error('VERCEL_TOKEN not set');
  const res = await fetch(`https://api.vercel.com${urlPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`${method} ${urlPath} → ${res.status}: ${text.slice(0, 500)}`);
  }
  return data;
}

async function main() {
  let project;
  try {
    project = await api('POST', `/v10/projects?teamId=${TEAM_ID}`, {
      name: PROJECT_NAME,
      framework: 'nextjs',
      gitRepository: {
        type: 'github',
        repo: REPO,
      },
    });
    console.log('Created project:', project.id, project.name);
  } catch (e) {
    if (String(e.message).includes('409') || String(e.message).includes('already exists')) {
      const list = await api('GET', `/v9/projects?teamId=${TEAM_ID}&search=${PROJECT_NAME}`);
      project = list.projects?.find((p) => p.name === PROJECT_NAME);
      console.log('Using existing project:', project?.id, project?.name);
    } else {
      throw e;
    }
  }

  if (!project?.id) throw new Error('No project id');

  const deployment = await api('POST', `/v13/deployments?teamId=${TEAM_ID}`, {
    name: PROJECT_NAME,
    project: project.id,
    target: 'production',
    gitSource: {
      type: 'github',
      org: 'drzh87',
      repo: 'furniture-catalog',
      ref: 'main',
    },
  });

  console.log('Deployment:', deployment.url);
  console.log('Production URL:', `https://${PROJECT_NAME}.vercel.app`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
