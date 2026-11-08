#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
java -version
javac -version
node --version
npm --version
python3 --version
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import net from 'node:net';
import {createRequire} from 'node:module';
const require=createRequire(new URL('./frontend/package.json', import.meta.url));
const {chromium}=require('@playwright/test');
assert.equal(require('@playwright/test/package.json').version,'1.64.1');
const browser=await chromium.connect(process.env.PLAYWRIGHT_WS_ENDPOINT??'ws://127.0.0.1:3000');
try {
  const page=await browser.newPage();
  await page.setContent('<title>Environnement local</title>');
  assert.equal(await page.title(),'Environnement local');
  console.log(`Chromium ${browser.version()} : OK`);
} finally {await browser.close();}
await new Promise((resolve,reject)=>{
  const socket=net.createConnection({host:process.env.PGHOST,port:Number(process.env.PGPORT)});
  socket.setTimeout(5000);
  socket.once('connect',()=>{socket.end();resolve();});
  socket.once('error',reject);
  socket.once('timeout',()=>{socket.destroy();reject(new Error('PostgreSQL inaccessible'));});
});
console.log('Connexion TCP PostgreSQL : OK');
JS
