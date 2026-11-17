#  Testing & Reliability Suite

tinny-backend is verified with a comprehensive 21-test automated suite ensuring complete reliability across all features:

## Automated Test Specification Matrix

| Suite | Tests | Status |
|-------|-------|--------|
| **Server Initialization** | Default options, custom options, logger recording |  Passed |
| **Routing & Verbs** | GET, POST, PUT, DELETE, 404 default fallback |  Passed |
| **Parameters & Queries** | Dynamic `:id`, query strings, trailing slash normalization |  Passed |
| **Middleware Pipeline** | Sequential execution, early short-circuit, global `use()` |  Passed |
| **Cookie Operations** | Setting, mutating, parsing client headers, `getAllCookies()` |  Passed |
| **Dependency Injection** | Registering and retrieving decorators |  Passed |
| **File Serving** | Single file `sendFile()`, recursive `servDir()`, entryPointFile |  Passed |
| **WebSockets** | Establishing duplex connection, echoing messages |  Passed |

---

## Writing Tests with Vitest & Bun Test

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Server from 'tinny-backend';

describe('API Test', () => {
  let server: Server;
  const port = 4921;

  beforeAll(async () => {
    server = new Server({ port, hostname: '127.0.0.1' });
    server.add({
      method: 'GET',
      path: '/ping',
      handler: (req, res) => res.send(200, { pong: true })
    });
    await new Promise<void>((resolve) => server.listen(() => resolve()));
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.getHttpServer().close(() => resolve()));
  });

  it('GET /ping responds with pong', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/ping`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ pong: true });
  });
});
```

Run test suite:

```bash
bun run test
# or
bun test src/test/framework.spec.ts
```
