#  API Reference

## Server Options (`ServerOptions`)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | `number` | `3000` | Port to listen on |
| `hostname` | `string` | `'localhost'` | Hostname or IP to bind |
| `ServerName` | `string` | `'Server'` | Server display name in logs |
| `DefaultHandler` | `HandlerFun` | 404 handler | Custom fallback handler |
| `reqPerMinute` | `number` | `undefined` | Request threshold metadata |

---

## Server Methods

- `server.add(options: AddOption)`: Registers a route with method, path, handler, middlewares, and next callback.
- `server.use(handler: HandlerFun)`: Registers global middleware.
- `server.decorate(name: string, data: any)`: Stores shared state or dependency.
- `server.useDecorator(name: string)`: Retrieves registered decorator.
- `server.readDir(DIR: string, prefix: string)`: Reads directory files recursively.
- `server.servDir(DIR: string, pref: string, entryPointFile?: string, middlewares?: HandlerFun[])`: Mounts a directory as static file routes.
- `server.createWsServer()`: Initializes the native WebSocket server.
- `server.getWsServer()`: Retrieves the underlying `ws.WebSocketServer`.
- `server.getUpTime()`: Returns server start timestamp.
- `server.getReqCount()`: Returns total requests processed.
- `server.getLogs()`: Returns array of recent log entries (up to 100).
- `server.listen(callback?: () => void)`: Starts listening for connections.

---

## Request Object (`ServerReq`)

Extends `http.IncomingMessage`:

- `req.ReqUrl`: Parsed WHATWG `URL` object
- `req.Query`: WHATWG `URLSearchParams` instance
- `req.queries`: Plain object representation of query parameters
- `req.body`: Parsed JSON (if `application/json`) or raw string
- `req.RawBody`: Buffer containing raw concatenated body chunks
- `req.ip`: Client IP address
- `req.params`: Route parameters dictionary (e.g. `{ id: '123' }`)
- `req.server`: Server instance reference

---

## Response Object (`ServerRes`)

Extends `http.ServerResponse`:

- `res.send(status: number, data?: any, headers?: object)`: Sends JSON response.
- `res.sendFile(path: string, status: number, headers?: object)`: Sends static file with MIME autodetection.
- `res.addCookie(name: string, value: string)`: Adds a cookie or updates existing cookie.
- `res.setCookie(name: string, value: string)`: Updates value of an existing cookie.
- `res.getCookie(name: string)`: Retrieves cookie object `{ key, value }` or `null`.
- `res.getAllCookies()`: Returns array of formatted cookie strings.
- `res.isClosed`: Boolean flag indicating if response was sent.
- `res.ip`: Client IP address.
