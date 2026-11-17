#  Futures & Framework Roadmap (RFCs)

This document tracks upcoming architectural initiatives and Request for Comments (RFCs) planned for `tinny-backend`.

---

## Roadmap Overview

| Initiative | Version | Status | Description |
|------------|---------|--------|-------------|
| **Radix Tree Router** | `v1.2.0` | In Review | Replaces linear array regex iteration with a high-performance prefix trie for O(k) path matching |
| **Async Onion Pipeline** | `v1.3.0` | Drafted | Koa-style `await next()` cascading middleware execution |
| **First-Party CORS Plugin** | `v1.2.0` | Accepted | Built-in CORS configuration helper |
| **Streaming Body Parser** | `v1.3.0` | Planning | Direct disk/stream pipes for large file uploads |
| **Native TLS & HTTP/2** | `v2.0.0` | Planning | `http2.createSecureServer()` integration |
| **OpenAPI 3.1 Spec Generator** | `v2.0.0` | Idea | Automatic Swagger JSON and docs generator |

---

## RFC 001: Radix Tree Router Engine

Currently, route matching iterates linearly through registered routes. For apps with large numbers of routes, a Radix Tree provides deterministic $O(k)$ route resolution:

```
/
├── api/
│   ├── users/
│   │   └── :id (param)
│   └── posts/
│       └── :slug (param)
└── static/
```

---

## RFC 002: Async Onion Middleware

Allows middlewares to wrap response lifecycles before and after handlers run:

```typescript
server.use(async (req, res, next) => {
  const start = performance.now();
  await next();
  const ms = performance.now() - start;
  res.setHeader('X-Response-Time', `${ms.toFixed(2)}ms`);
});
```
