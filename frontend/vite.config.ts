import { defineConfig } from 'vite';
export default defineConfig({server: {allowedHosts:['host.containers.internal'],proxy: {'/api': 'http://localhost:8080'}}});
