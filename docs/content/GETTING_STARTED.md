#  Getting Started with tinny-backend

`tinny-backend` is an ultra-lightweight routing system for Node.js and Bun with native support for dynamic route parameters, middleware chains, recursive static file serving, cookie management, dependency injection, and WebSockets.

---

## Prerequisites

- **Node.js**: `>= 24.13.1` (or modern LTS supporting ESM and standard HTTP)
- **Bun**: `>= 1.0` (fully supported and verified)
- **TypeScript**: `>= 5.0`

---

## Installation

```bash
# Using Bun (recommended)
bun add tinny-backend

# Using npm
npm install tinny-backend

# Using pnpm
pnpm add tinny-backend
```

---

## Hello World Server

Create `server.ts`:

```typescript
import Server, { createServer } from 'tinny-backend';

const server = createServer({
  port: 3000,
  hostname: 'localhost',
  ServerName: 'MyBackend'
});

// Basic GET route
server.add({
  method: 'GET',
  path: '/',
  handler: (req, res) => {
    res.send(200, {
      message: 'Hello from tinny-backend!',
      time: new Date().toISOString()
    });
  }
});

// Dynamic parameter route
server.add({
  method: 'GET',
  path: '/users/:id',
  handler: (req, res) => {
    res.send(200, {
      userId: req.params.id,
      ip: req.ip
    });
  }
});

server.listen(() => {
  console.log(' Server listening at http://localhost:3000');
});
```

Run directly:

```bash
bun server.ts
# or
npx tsx server.ts
```
