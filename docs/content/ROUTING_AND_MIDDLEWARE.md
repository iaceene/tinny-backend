#  Routing & Middleware Engine

## Routing

Routes are registered using `server.add(options)`.

```typescript
server.add({
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  handler: (req: ServerReq, res: ServerRes) => void | Promise<void>,
  middelWares?: HandlerFun[],
  next?: HandlerFun
});
```

### Dynamic Parameters

Segments starting with `:` are compiled into capture groups:

```typescript
server.add({
  method: 'GET',
  path: '/teams/:teamId/projects/:projectId',
  handler: (req, res) => {
    const { teamId, projectId } = req.params;
    res.send(200, { teamId, projectId });
  }
});
```

### Trailing Slash Handling

Paths like `/api/users/` and `/api/users` match the same route definition automatically via internal normalization `/(?<=.)\/+$/`.

### Query Parameters

Query strings are parsed into two representations on the request:
- `req.Query`: Native WHATWG `URLSearchParams` instance
- `req.queries`: Plain JavaScript object dictionary

```typescript
// Request: /search?q=framework&page=1
server.add({
  method: 'GET',
  path: '/search',
  handler: (req, res) => {
    const q = req.Query.get('q');
    const all = req.queries; // { q: 'framework', page: '1' }
    res.send(200, { q, all });
  }
});
```

---

## Middlewares

### Route-Level Middlewares

Pass an array to `middelWares`. If any middleware sends a response, execution halts:

```typescript
const authGuard = (req: ServerReq, res: ServerRes) => {
  const token = res.getCookie('auth_token');
  if (!token) {
    res.send(401, { error: 'Unauthorized' });
    return;
  }
};

server.add({
  method: 'POST',
  path: '/api/protected',
  middelWares: [authGuard],
  handler: (req, res) => {
    res.send(200, { secret: '42' });
  }
});
```

### Global Middleware

```typescript
server.use((req, res) => {
  res.setHeader('X-Powered-By', 'tinny-backend');
});
```

### Post-Handler Callback (next)

```typescript
server.add({
  method: 'POST',
  path: '/api/audit',
  handler: (req, res) => {
    // perform operation
  },
  next: (req, res) => {
    // runs after handler if response is not closed
    res.send(200, { audited: true });
  }
});
```
