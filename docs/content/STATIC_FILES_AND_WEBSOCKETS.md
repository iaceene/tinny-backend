#  Static Files & WebSockets

## Static Directory Serving (`server.servDir`)

Mounts an entire folder recursively and automatically creates GET routes for every file:

```typescript
import Server from 'tinny-backend';
import path from 'node:path';

const server = new Server({ port: 3000 });

// Mount ./public at / and make index.html the root fallback
await server.servDir(
  path.join(process.cwd(), './public'),
  '/',
  'index.html'
);

// Mount ./uploads at /files with custom auth middleware
await server.servDir(
  path.join(process.cwd(), './uploads'),
  '/files',
  undefined,
  [authMiddleware]
);

server.listen();
```

### Supported MIME Types in `res.sendFile()`

- `.html`: `text/html`
- `.css`: `text/css`
- `.js`: `text/javascript`
- `.json`: `application/json`
- `.png`: `image/png`
- `.jpg` / `.jpeg`: `image/jpeg`
- `.txt`: `text/plain`
- `.mp4`: `video/mp4`
- `.webm`: `video/webm`
- `.ogg`: `video/ogg`
- `.avi`: `video/x-msvideo`
- Fallback: `application/octet-stream`

---

## WebSockets (`TinnyWs`)

`tinny-backend` embeds `ws` directly into the HTTP server:

```typescript
import Server from 'tinny-backend';
import { WebSocket, RawData } from 'ws';

const server = new Server({ port: 3000 });
const wss = server.createWsServer().getWsServer();

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (data: RawData) => {
    const text = data.toString();
    ws.send(`Echo: ${text}`);
  });
});

server.listen();
```
