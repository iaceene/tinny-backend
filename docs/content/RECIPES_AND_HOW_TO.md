#  Real-World Recipes & How-To Guides

## Recipe 1: Production REST API

```typescript
import Server from 'tinny-backend';

interface Item {
  id: string;
  name: string;
  price: number;
}

const items = new Map<string, Item>();
const server = new Server({ port: 3000 });

// GET /items
server.add({
  method: 'GET',
  path: '/items',
  handler: (req, res) => {
    res.send(200, Array.from(items.values()));
  }
});

// POST /items
server.add({
  method: 'POST',
  path: '/items',
  handler: (req, res) => {
    const { name, price } = req.body || {};
    if (!name || price === undefined) {
      return res.send(400, { error: 'Missing name or price' });
    }
    const id = Date.now().toString();
    const item = { id, name, price };
    items.set(id, item);
    res.send(201, item);
  }
});

// GET /items/:id
server.add({
  method: 'GET',
  path: '/items/:id',
  handler: (req, res) => {
    const item = items.get(req.params.id);
    if (!item) return res.send(404, { error: 'Item not found' });
    res.send(200, item);
  }
});

server.listen();
```

---

## Recipe 2: JWT & Cookie Authentication

```typescript
import Server, { ServerReq, ServerRes } from 'tinny-backend';

const server = new Server({ port: 3000 });

// Auth Middleware
const authGuard = (req: ServerReq, res: ServerRes) => {
  const cookie = res.getCookie('token');
  if (!cookie || cookie.value !== 'valid_secret') {
    return res.send(401, { error: 'Unauthorized' });
  }
};

// Login
server.add({
  method: 'POST',
  path: '/api/login',
  handler: (req, res) => {
    const { username, password } = req.body || {};
    if (username === 'admin' && password === 'admin123') {
      res.addCookie('token', 'valid_secret');
      return res.send(200, { message: 'Logged in' });
    }
    res.send(401, { error: 'Invalid credentials' });
  }
});

// Protected Profile
server.add({
  method: 'GET',
  path: '/api/profile',
  middelWares: [authGuard],
  handler: (req, res) => {
    res.send(200, { user: 'admin', role: 'developer' });
  }
});

server.listen();
```
