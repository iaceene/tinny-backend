# tinny-backend

A lightweight routing system for Node.js with built-in file serving, JWT authentication, and monitoring capabilities.

## Features

- HTTP routing with support for GET, POST, PUT, DELETE methods
- Dynamic route parameters (e.g., `/users/:id`)
- Middleware chain support
- Static file serving with automatic MIME type detection
- Cookie management
- JWT authentication and session management
- Built-in admin monitoring dashboard
- TypeScript support with full type definitions
- Session tracking and rate limiting

## Installation

```bash
npm install tinny-backend
```

## Quick Start

```typescript
import Server from 'tinny-backend';

const server = new Server({
  port: 3000,
  hostname: 'localhost',
  ServerName: 'MyApp'
});

// Basic route
server.add({
  method: 'GET',
  path: '/',
  handler: (req, res) => {
    res.send(200, { message: 'Hello World!' });
  }
});

// Route with parameters
server.add({
  method: 'GET',
  path: '/users/:id',
  handler: (req, res) => {
    const userId = req.params.id;
    res.send(200, { userId });
  }
});

// Route with middleware
server.add({
  method: 'POST',
  path: '/api/data',
  middelWares: [authMiddleware],
  handler: (req, res) => {
    res.send(200, { received: req.body });
  }
});

// Serve static files
server.servDir('./public', 'static');

server.listen();
```

## API Reference

### Server Constructor

```typescript
new Server(options: ServerOptions)
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | number | 3000 | Server port |
| `hostname` | string | 'localhost' | Server hostname |
| `ServerName` | string | 'Server' | Server display name |
| `DefaultHandler` | HandlerFun | 404 handler | Default route handler |

### Adding Routes

```typescript
server.add({
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  handler: HandlerFun,
  middelWares?: HandlerFun[],
  next?: HandlerFun
})
```

### Request Object (ServerReq)

| Property | Type | Description |
|----------|------|-------------|
| `ReqUrl` | URL | Parsed request URL |
| `Query` | URLSearchParams | Query parameters |
| `queries` | object | Query parameters as object |
| `body` | any | Request body (parsed JSON) |
| `ip` | string | Client IP address |
| `params` | Record<string, string> | Route parameters |
| `server` | Server | Server instance |

### Response Object (ServerRes)

| Method | Description |
|--------|-------------|
| `send(status, data?, headers?)` | Send JSON response |
| `sendFile(status, contentType, data, headers?)` | Send file response |
| `addCookie(name, value)` | Add cookie |
| `getCookie(name)` | Get cookie |
| `setCookie(name, value)` | Update cookie |
| `getAllCookies()` | Get all cookies |

### File Serving

```typescript
// Serve a directory
server.servDir('./public', 'static');

// Read directory contents
const files = await server.readDir('./public', 'static');
```

### Monitoring

The server includes a built-in monitoring system that provides an admin dashboard with real-time metrics.

Enable monitoring:

```typescript
server.listen(true); // Enables monitoring
```

**Environment Variables Required:**

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password
ADMIN_KEY=your_jwt_secret_key
```

**Monitoring Routes:**

- `/` - Admin dashboard
- `/api/login` - Login endpoint
- `/api/logout` - Logout endpoint
- `/admin/status` - Server status and metrics
- `/messages` - Server logs

## Examples

### Authentication Middleware

```typescript
const authMiddleware = (req: ServerReq, res: ServerRes) => {
  const token = res.getCookie('token');
  if (!token) {
    res.send(401, { error: 'Unauthorized' });
    return;
  }
  // Verify token logic
};
```

### File Upload Handling

```typescript
server.add({
  method: 'POST',
  path: '/upload',
  handler: async (req, res) => {
    // Handle file upload
    const fileData = req.body;
    res.send(200, { success: true });
  }
});
```

## Configuration

Create a `.env` file for monitoring configuration:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
ADMIN_KEY=your_jwt_secret
```

## License

MIT

## Author

Yassine Ajagrou

## Links

- [GitHub Repository](https://github.com/iaceene/tinny-backend)
- [npm Package](https://www.npmjs.com/package/tinny-backend)
