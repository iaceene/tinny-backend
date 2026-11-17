import Server from '../src/index.js';
import path from 'node:path';

const server = new Server({
  port: 4000,
  hostname: 'localhost',
  ServerName: 'TinnyDocs'
});

const distDir = path.join(__dirname, 'dist');
await server.servDir(distDir, '/', 'index.html');

server.listen(() => {
  console.log('\n📚 Documentation preview server is live:');
  console.log('   ➜ Local: http://localhost:4000/\n');
});
