#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/pole-formation
test -w .
java -version
javac -version
node --version
npm --version
export NODE_PATH="$(npm root -g)"
node <<'JS'
const assert = require('node:assert/strict');
const net = require('node:net');
const { chromium } = require('@playwright/test');
assert.equal(require('@playwright/test/package.json').version, '1.64.1');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent('<title>Devcontainer</title>');
    assert.equal(await page.title(), 'Devcontainer');
    console.log(`Chromium ${browser.version()} : OK`);
  } finally {
    await browser.close();
  }
  await new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: process.env.PGHOST, port: Number(process.env.PGPORT) });
    socket.setTimeout(5000);
    socket.once('connect', () => { socket.end(); resolve(); });
    socket.once('error', reject);
    socket.once('timeout', () => { socket.destroy(); reject(new Error('PostgreSQL inaccessible')); });
  });
  console.log('Connexion TCP PostgreSQL : OK (authentification SQL à vérifier séparément)');
})().catch(error => { console.error(error); process.exitCode = 1; });
JS
