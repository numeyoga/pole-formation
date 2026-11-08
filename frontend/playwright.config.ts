import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests', fullyParallel:false, workers:1, retries:0,
  reporter:'list', use:{
    baseURL:process.env.PLAYWRIGHT_BASE_URL??'http://host.containers.internal:8080',
    connectOptions:{wsEndpoint:process.env.PLAYWRIGHT_WS_ENDPOINT??'ws://127.0.0.1:3000'},
    browserName:'chromium',viewport:{width:1440,height:900},trace:'retain-on-failure',
  },
});
