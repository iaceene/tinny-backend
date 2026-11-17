export interface DocContentBlock {
  heading?: string;
  subheading?: string;
  text?: string;
  code?: string;
  codeLang?: string;
  codeFilename?: string;
  callout?: {
    type: 'note' | 'tip' | 'important' | 'warning';
    title?: string;
    text: string;
  };
  table?: {
    headers: string[];
    rows: string[][];
  };
  customComponent?: 'route-tester' | 'cookie-simulator' | 'architecture-diagram' | 'author-profile';
}

export interface DocSection {
  id: string;
  title: string;
  category: string;
  description: string;
  badge?: string;
  iconName?: string;
  content: DocContentBlock[];
}

export const docsSections: DocSection[] = [
  {
    id: 'overview',
    category: 'Getting Started',
    title: 'Overview & Philosophy',
    iconName: 'Compass',
    description: 'Learn why tinny-backend was built, its core principles, and how it compares to other Node.js frameworks.',
    badge: 'v1.1.2',
    content: [
      {
        heading: 'What is tinny-backend?',
        text: 'tinny-backend is a modern, lightweight, and blazingly fast backend routing framework engineered on top of native Node.js and Bun runtimes. It is designed for developers who want a minimalist, transparent routing layer without the bloat, convoluted abstractions, or hidden performance penalties of monolithic frameworks.'
      },
      {
        callout: {
          type: 'tip',
          title: 'Zero Runtime Bloat',
          text: 'tinny-backend has minimal dependencies (only the industry-standard ws package for WebSockets) and uses native Node.js / Bun standard library primitives for HTTP, crypto, path, and file system operations.'
        }
      },
      {
        heading: 'Core Highlights',
        text: 'Everything you need to build microservices, REST APIs, static file servers, and real-time WebSocket applications is built directly into the core:'
      },
      {
        table: {
          headers: ['Feature', 'Capability', 'Benefit'],
          rows: [
            ['Expressive Routing', 'GET, POST, PUT, DELETE with :param regex compilation', 'Fast dynamic parameter extraction without complex router setup'],
            ['Native WebSockets', 'Integrated ws.WebSocketServer directly on the HTTP server', 'Zero-config real-time event streaming and duplex communication'],
            ['Static File & Directory Serving', 'Recursive directory indexing with MIME type autodetection', 'Host SPAs, static assets, images, and videos with a single servDir() call'],
            ['Cookie Management', 'Native getCookie, setCookie, addCookie, getAllCookies', 'Manage browser sessions and auth tokens without external cookie parsers'],
            ['Middleware Chains', 'Sequential route-level arrays and global interceptors', 'Precise execution order with writableEnded short-circuit safety'],
            ['Dependency Injection', 'Lightweight decorate() and useDecorator() state store', 'Effortlessly share database pools, auth clients, and config across routes']
          ]
        }
      },
      {
        heading: 'Framework Comparison',
        text: 'How tinny-backend compares to the mainstream ecosystem:'
      },
      {
        table: {
          headers: ['Framework', 'Core Dependencies', 'Built-in WebSockets', 'Built-in servDir()', 'Bundle / Memory Size'],
          rows: [
            ['tinny-backend', '1 (ws)', '✅ Native (TinnyWs)', '✅ Recursive with MIME auto-detection', 'Ultra-light (< 50 KB)'],
            ['Express', '30+ transitive', '❌ Requires ws or socket.io', '⚠️ express.static only', 'Medium'],
            ['Fastify', '20+ transitive', '❌ Requires @fastify/websocket', '❌ Requires @fastify/static', 'Medium-High'],
            ['Hono', 'Zero (multi-runtime)', '⚠️ Adapter dependent', '⚠️ Adapter dependent', 'Ultra-light']
          ]
        }
      }
    ]
  },
  {
    id: 'quickstart',
    category: 'Getting Started',
    title: 'Installation & Quickstart',
    iconName: 'Terminal',
    description: 'Get your first tinny-backend server up and running in under 2 minutes.',
    content: [
      {
        heading: 'Prerequisites',
        text: 'tinny-backend runs natively on modern JavaScript runtimes:'
      },
      {
        text: '• Node.js >= 24.13.1 (or any LTS version supporting ESM and Node HTTP)\n• Bun >= 1.0 (recommended for ultra-fast startup and built-in testing)\n• TypeScript >= 5.0 for full type inference and autocompletion'
      },
      {
        heading: 'Installation',
        text: 'Install tinny-backend from npm using your preferred package manager:'
      },
      {
        code: `# Using Bun (recommended)
bun add tinny-backend

# Using npm
npm install tinny-backend

# Using pnpm
pnpm add tinny-backend

# Using yarn
yarn add tinny-backend`,
        codeLang: 'bash',
        codeFilename: 'Terminal'
      },
      {
        heading: 'TypeScript Configuration',
        text: 'Ensure your tsconfig.json is configured for ECMAScript modules (NodeNext or Bundler):'
      },
      {
        code: `{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}`,
        codeLang: 'json',
        codeFilename: 'tsconfig.json'
      },
      {
        heading: 'Your First Server (Hello World)',
        text: 'Create a new file named server.ts and initialize your server:'
      },
      {
        code: `import Server, { createServer } from 'tinny-backend';

// Initialize server instance
const server = createServer({
  port: 3000,
  hostname: 'localhost',
  ServerName: 'MyApi'
});

// Define a basic GET route
server.add({
  method: 'GET',
  path: '/',
  handler: (req, res) => {
    res.send(200, {
      message: 'Hello from tinny-backend!',
      timestamp: new Date().toISOString()
    });
  }
});

// Define a route with dynamic parameters
server.add({
  method: 'GET',
  path: '/users/:id',
  handler: (req, res) => {
    const userId = req.params.id;
    res.send(200, { userId, active: true });
  }
});

// Start listening for incoming requests
server.listen(() => {
  console.log('Server is running at http://localhost:3000');
});`,
        codeLang: 'typescript',
        codeFilename: 'server.ts'
      },
      {
        callout: {
          type: 'tip',
          title: 'Running with Bun or tsx',
          text: 'Run this file directly with "bun server.ts" or "npx tsx server.ts" without manual compilation!'
        }
      }
    ]
  },
  {
    id: 'architecture',
    category: 'Architecture',
    title: 'Architecture & Lifecycle',
    iconName: 'Cpu',
    description: 'Understand the internal request-response lifecycle, event handlers, and data parsing pipeline.',
    content: [
      {
        heading: 'Request Lifecycle Overview',
        text: 'When an HTTP connection arrives at the underlying Node/Bun http.Server, tinny-backend runs a deterministic pipeline through RequestParser and ResponseParser before routing the request to your handlers.',
        customComponent: 'architecture-diagram'
      },
      {
        heading: '1. RequestParser Internals',
        text: 'The RequestParser augments the native http.IncomingMessage into a fully-typed ServerReq object:',
        code: `// Inside RequestParser:
const NewUrl = "http://" + server.getHost() + ":" + server.getPort() + (req.url ?? "");
req.ReqUrl = URL.parse(NewUrl);
req.ReqUrl.pathname = req.ReqUrl?.pathname.replace(/(?<=.)\\/+$/, "");
req.Query = new URLSearchParams(req.ReqUrl.searchParams);
req.queries = Object.fromEntries(req.Query);

// Client IP resolution
req.ip = req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() 
      || req.headers["x-real-ip"]?.toString()
      || req.socket.remoteAddress?.split(':').pop()
      || "UNKNOWN_IP";`,
        codeLang: 'typescript'
      },
      {
        heading: '2. Body Streaming & JSON Parsing',
        text: 'Incoming request chunks are buffered on the data event. Once end fires, tinny-backend combines chunks into req.RawBody (a Buffer), and if Content-Type is application/json, parses it into req.body with safe error handling:',
        code: `req.on("data", (chunk) => {
  body += chunk.toString();
  rawChunks.push(chunk);
});

req.on("end", async () => {
  Req.RawBody = Buffer.concat(rawChunks);
  if (req.headers["content-type"] === "application/json") {
    try {
      Req.body = body ? JSON.parse(body) : null;
    } catch {
      Req.body = body;
    }
  } else {
    Req.body = body;
  }
  // Route matching & handler execution...
});`,
        codeLang: 'typescript'
      },
      {
        heading: '3. ResponseParser Internals',
        text: 'The native http.ServerResponse is wrapped with cookie management methods (res.getCookie, res.setCookie, res.addCookie, res.getAllCookies) and response dispatchers (res.send, res.sendFile) with an isClosed boolean guard to prevent multiple reply collisions.'
      }
    ]
  },
  {
    id: 'routing',
    category: 'Core Concepts',
    title: 'Routing Engine',
    iconName: 'Route',
    description: 'Master HTTP methods, dynamic route parameters, query string handling, and trailing slash rules.',
    content: [
      {
        heading: 'Registering Routes with server.add()',
        text: 'Routes are registered using server.add(options). The options object takes:',
        table: {
          headers: ['Property', 'Type', 'Required', 'Description'],
          rows: [
            ['method', '"GET" | "POST" | "PUT" | "DELETE"', 'Yes', 'HTTP verb to match'],
            ['path', 'string', 'Yes', 'Route path (supports dynamic parameters like :id)'],
            ['handler', '(req: ServerReq, res: ServerRes) => void | Promise<void>', 'Yes', 'Main route handler function'],
            ['middelWares', 'HandlerFun[]', 'No', 'Array of middleware functions executed before handler'],
            ['next', 'HandlerFun', 'No', 'Post-handler callback executed after handler if response is not ended']
          ]
        }
      },
      {
        heading: 'Dynamic Route Parameters (:param)',
        text: 'Define dynamic segments by prefixing the segment with a colon :. The router transforms these into capture groups and populates req.params:',
        code: `// Single parameter
server.add({
  method: 'GET',
  path: '/users/:userId',
  handler: (req, res) => {
    const { userId } = req.params;
    res.send(200, { userId });
  }
});

// Multiple parameters
server.add({
  method: 'GET',
  path: '/teams/:teamId/projects/:projectId',
  handler: (req, res) => {
    const { teamId, projectId } = req.params;
    res.send(200, { teamId, projectId });
  }
});`,
        codeLang: 'typescript'
      },
      {
        heading: 'Interactive Route Matcher',
        text: 'Test how the routing engine matches paths and extracts parameters live:',
        customComponent: 'route-tester'
      },
      {
        heading: 'Query String Parsing',
        text: 'Query strings are parsed into both a native URLSearchParams instance (req.Query) and a convenient key-value JavaScript object (req.queries):',
        code: `// GET /search?q=typescript&limit=10&page=2
server.add({
  method: 'GET',
  path: '/search',
  handler: (req, res) => {
    // Access as plain object
    const queryObj = req.queries; // { q: 'typescript', limit: '10', page: '2' }
    
    // Access with URLSearchParams API
    const limit = req.Query.get('limit'); // '10'
    const hasSort = req.Query.has('sort'); // false

    res.send(200, { queryObj, limit });
  }
});`,
        codeLang: 'typescript'
      },
      {
        heading: 'Trailing Slash Normalization',
        text: 'tinny-backend automatically normalizes paths using the regular expression /(?<=.)\\/+$/, so requests to /api/users/ and /api/users match the exact same route definition seamlessly without redirects.'
      },
      {
        heading: 'Custom 404 & Default Handler',
        text: 'If no registered route matches an incoming request, the server executes DefaultHandler. You can customize this handler in ServerOptions:',
        code: `const server = new Server({
  port: 8080,
  DefaultHandler: (req, res) => {
    res.send(404, {
      error: 'Resource Not Found',
      path: req.ReqUrl?.pathname,
      suggestion: 'Check the API documentation for valid endpoints'
    });
  }
});`,
        codeLang: 'typescript'
      }
    ]
  },
  {
    id: 'middleware',
    category: 'Core Concepts',
    title: 'Middleware System',
    iconName: 'ShieldCheck',
    description: 'Learn how to use route-level middlewares, global interceptors, and post-handler next callbacks.',
    content: [
      {
        heading: 'Middleware Types in tinny-backend',
        text: 'tinny-backend provides three distinct levels of middleware execution:'
      },
      {
        table: {
          headers: ['Level', 'Registration Method', 'Execution Timing', 'Common Use Cases'],
          rows: [
            ['Route Middleware', 'middelWares: [fn1, fn2] in server.add', 'Runs sequentially before the route handler', 'Authentication, schema validation, permission checks'],
            ['Post-Handler Next', 'next: fn in server.add', 'Runs after handler if response is not closed', 'Metrics logging, audit trails, response post-processing'],
            ['Global Middleware', 'server.use(fn)', 'Runs for every incoming request', 'Global CORS, analytics, request timing, security headers']
          ]
        }
      },
      {
        heading: 'Route-Level Middlewares',
        text: 'Middlewares are standard HandlerFun functions (req: ServerReq, res: ServerRes) => void | Promise<void>. If any middleware finishes the response (calls res.send or res.sendFile), execution stops immediately:',
        code: `// Authentication middleware
const requireAuth = (req: ServerReq, res: ServerRes) => {
  const token = res.getCookie('auth_token');
  if (!token) {
    res.send(401, { error: 'Unauthorized: Missing auth_token cookie' });
    return;
  }
  // Attach user identity to request object
  (req as any).user = { id: 101, username: 'dev' };
};

// Rate limiting middleware
const rateLimiter = (req: ServerReq, res: ServerRes) => {
  // Check IP request frequency
  if (req.server.getReqCount() > 10000) {
    res.send(429, { error: 'Too Many Requests' });
  }
};

// Protect a route with both middlewares
server.add({
  method: 'GET',
  path: '/api/dashboard',
  middelWares: [rateLimiter, requireAuth],
  handler: (req, res) => {
    const user = (req as any).user;
    res.send(200, { message: \`Welcome \${user.username}\`, stats: [10, 20, 30] });
  }
});`,
        codeLang: 'typescript'
      },
      {
        heading: 'Global Middleware with server.use()',
        text: 'Register application-wide middleware that runs on all incoming requests:',
        code: `server.use((req, res) => {
  // Set security headers on all responses
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  // Intercept specific global paths
  if (req.ReqUrl?.pathname === '/healthz') {
    res.send(200, { status: 'healthy', uptime: req.server.getUpTime() });
  }
});`,
        codeLang: 'typescript'
      },
      {
        heading: 'Post-Handler Callback (next)',
        text: 'The next property in AddOption executes after your main handler finishes, provided the response was not already ended:',
        code: `server.add({
  method: 'POST',
  path: '/api/orders',
  handler: async (req, res) => {
    // Process order in database
    (req as any).orderCreated = true;
  },
  next: async (req, res) => {
    // Send response and trigger background audit
    res.send(201, { success: true });
    req.server.log('Order successfully placed and verified', 'message');
  }
});`,
        codeLang: 'typescript'
      }
    ]
  },
  {
    id: 'request-response',
    category: 'API Reference',
    title: 'Request & Response API',
    iconName: 'FileCode',
    description: 'Comprehensive API specifications for ServerReq and ServerRes objects.',
    content: [
      {
        heading: 'ServerReq (Request Object)',
        text: 'ServerReq extends Node.js http.IncomingMessage with modern parsing properties:'
      },
      {
        table: {
          headers: ['Property', 'Type', 'Description'],
          rows: [
            ['req.ReqUrl', 'URL | null', 'Standard WHATWG URL object for the parsed request'],
            ['req.Query', 'URLSearchParams', 'Query parameters as a WHATWG URLSearchParams instance'],
            ['req.queries', 'object', 'Plain key-value dictionary of query string parameters'],
            ['req.body', 'any', 'Parsed JSON object if application/json, or raw string otherwise'],
            ['req.RawBody', 'Buffer', 'Full binary Buffer of concatenated request body chunks'],
            ['req.ip', 'string', 'Client IP address resolved from x-forwarded-for, x-real-ip, or socket'],
            ['req.params', 'Record<string, string>', 'Extracted dynamic route parameters (e.g. { id: "123" })'],
            ['req.server', 'Server', 'Reference to the active Server instance']
          ]
        }
      },
      {
        heading: 'ServerRes (Response Object)',
        text: 'ServerRes extends Node.js http.ServerResponse with chainable helper methods:'
      },
      {
        table: {
          headers: ['Method / Property', 'Signature', 'Description'],
          rows: [
            ['res.send()', '(status: number, data?: any, headers?: object) => void', 'Sends JSON response with Content-Type application/json'],
            ['res.sendFile()', '(path: string, status: number, headers?: object) => Promise<void>', 'Streams static file with automatic MIME type resolution'],
            ['res.addCookie()', '(name: string, value: string) => void', 'Adds a cookie or updates existing cookie value'],
            ['res.getCookie()', '(name: string) => Cookie | null', 'Retrieves cookie by key ({ key, value } or null)'],
            ['res.setCookie()', '(name: string, value: string) => void', 'Mutates value of an existing cookie'],
            ['res.getAllCookies()', '() => string[]', 'Returns formatted cookie strings array ["key=val;"]'],
            ['res.isClosed', 'boolean', 'Flag indicating if the response stream has ended'],
            ['res.ip', 'string', 'Client IP address corresponding to the request']
          ]
        }
      },
      {
        heading: 'res.send() Usage Examples',
        code: `// Send 200 OK with JSON payload
res.send(200, { message: 'Operation succeeded' });

// Send 201 Created with custom headers
res.send(201, { id: 'new_item_42' }, { 'Location': '/items/new_item_42' });

// Send 204 No Content
res.send(204);`,
        codeLang: 'typescript'
      }
    ]
  },
  {
    id: 'file-serving',
    category: 'Core Concepts',
    title: 'Static Files & Directory Serving',
    iconName: 'FolderTree',
    description: 'Host directories recursively with server.servDir() and stream files with res.sendFile().',
    content: [
      {
        heading: 'Serving Directories with server.servDir()',
        text: 'tinny-backend includes built-in static asset hosting. The servDir() method traverses the directory recursively using native Node fs.promises.readdir, registers a GET route for each file matching its relative path, and optionally serves an entry point file (like index.html) at the root prefix:'
      },
      {
        code: `import Server from 'tinny-backend';
import path from 'node:path';

const server = new Server({ port: 3000 });

// Mount public directory at root / with index.html as entry point
await server.servDir(
  path.join(process.cwd(), './public'), // Directory on disk
  '/',                                   // URL prefix
  'index.html'                           // Entry point file mounted at prefix root
);

// Mount assets directory at /static
await server.servDir(
  path.join(process.cwd(), './assets'),
  '/static'
);

server.listen();`,
        codeLang: 'typescript'
      },
      {
        heading: 'Single Page Application (SPA) Routing',
        text: 'For modern frontends (React, Vue, Svelte, Vite), you can serve static assets and catch all remaining GET routes with your index.html fallback:',
        code: `const distPath = path.join(process.cwd(), './dist');

// Serve all assets (.js, .css, images)
await server.servDir(distPath, '/');

// SPA fallback for client-side routing
server.add({
  method: 'GET',
  path: '/:any',
  handler: (req, res) => {
    return res.sendFile(path.join(distPath, 'index.html'), 200);
  }
});`,
        codeLang: 'typescript'
      },
      {
        heading: 'Supported MIME Types',
        text: 'res.sendFile() automatically determines the appropriate Content-Type header based on file extension:'
      },
      {
        table: {
          headers: ['Extension', 'Resolved Content-Type Header'],
          rows: [
            ['.html', 'text/html'],
            ['.css', 'text/css'],
            ['.js', 'text/javascript'],
            ['.json', 'application/json'],
            ['.png', 'image/png'],
            ['.jpg / .jpeg', 'image/jpeg'],
            ['.txt', 'text/plain'],
            ['.mp4', 'video/mp4'],
            ['.webm', 'video/webm'],
            ['.ogg', 'video/ogg'],
            ['.avi', 'video/x-msvideo'],
            ['Other / Unknown', 'application/octet-stream']
          ]
        }
      }
    ]
  },
  {
    id: 'cookies',
    category: 'Core Concepts',
    title: 'Cookie Management',
    iconName: 'Cookie',
    description: 'Read, write, and manage HTTP cookies natively without third-party dependencies.',
    content: [
      {
        heading: 'Cookie Lifecycle in tinny-backend',
        text: 'When a request enters ResponseParser, tinny-backend automatically parses the incoming Cookie HTTP header into internal state. You can read client cookies, add new response cookies, or mutate existing ones directly on res:'
      },
      {
        customComponent: 'cookie-simulator'
      },
      {
        heading: 'Cookie API Methods',
        code: `server.add({
  method: 'POST',
  path: '/api/login',
  handler: (req, res) => {
    // 1. Set a cookie on response
    res.addCookie('session_id', 'sess_99x77abc');
    res.addCookie('theme', 'dark');

    // 2. Read cookie
    const currentTheme = res.getCookie('theme'); // { key: 'theme', value: 'dark' }

    // 3. Mutate cookie value
    res.setCookie('theme', 'nord');

    // 4. Retrieve all cookies formatted as strings
    const all = res.getAllCookies(); // ["session_id=sess_99x77abc;", "theme=nord;"]

    res.send(200, { success: true, cookies: all });
  }
});`,
        codeLang: 'typescript'
      },
      {
        heading: 'Reading Incoming Client Cookies',
        text: 'Incoming client cookies are automatically parsed and accessible via res.getCookie(name):',
        code: `const authGuard = (req: ServerReq, res: ServerRes) => {
  const sessionCookie = res.getCookie('session_id');
  if (!sessionCookie || !sessionCookie.value) {
    res.send(401, { error: 'Authentication required' });
    return;
  }
  // Validate session...
};`,
        codeLang: 'typescript'
      }
    ]
  },
  {
    id: 'websockets',
    category: 'Advanced',
    title: 'WebSockets Integration',
    iconName: 'Radio',
    description: 'Build real-time duplex communications with native WebSocket support built right into your server.',
    content: [
      {
        heading: 'Native TinnyWs Architecture',
        text: 'tinny-backend features built-in WebSocket support using TinnyWs, which binds ws.WebSocketServer directly to the underlying Node http.Server instance on the exact same port. No separate port or server instance is required!'
      },
      {
        heading: 'Setting Up a WebSocket Server',
        code: `import Server from 'tinny-backend';
import { WebSocket, RawData } from 'ws';

const server = new Server({ port: 3000 });

// Initialize and retrieve WebSocket server instance
const wss = server.createWsServer().getWsServer();

// Listen for client connections
wss.on('connection', (ws: WebSocket, req) => {
  server.log('New WebSocket client connected', 'message');

  // Handle incoming messages
  ws.on('message', (data: RawData) => {
    const message = data.toString();
    server.log(\`Received message: \${message}\`, 'message');

    // Echo message back to sender
    ws.send(JSON.stringify({ type: 'echo', data: message }));
  });

  // Handle connection close
  ws.on('close', (code, reason) => {
    server.log(\`Client disconnected: \${code} \${reason.toString()}\`, 'message');
  });

  // Send initial welcome message
  ws.send(JSON.stringify({ type: 'connected', version: '1.1.2' }));
});

server.listen();`,
        codeLang: 'typescript'
      },
      {
        heading: 'Broadcasting to All Connected Clients',
        text: 'Broadcast notifications or chat messages across all active clients easily:',
        code: `function broadcast(wss: any, payload: object) {
  const data = JSON.stringify(payload);
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Trigger broadcast from an HTTP route:
server.add({
  method: 'POST',
  path: '/api/announcements',
  handler: (req, res) => {
    const wss = req.server.getWsServer();
    broadcast(wss, { type: 'ANNOUNCEMENT', message: req.body?.message });
    res.send(200, { broadcasted: true });
  }
});`,
        codeLang: 'typescript'
      }
    ]
  },
  {
    id: 'decorators',
    category: 'Advanced',
    title: 'Decorators & Dependency Injection',
    iconName: 'Puzzle',
    description: 'Inject databases, caching clients, and shared services across routes using decorators.',
    content: [
      {
        heading: 'What are Decorators?',
        text: 'Decorators in tinny-backend provide a lightweight Dependency Injection (DI) mechanism. Instead of importing singleton instances everywhere, you register state or clients on the server instance using server.decorate(name, data), and access them anywhere with server.useDecorator(name) or req.server.useDecorator(name).'
      },
      {
        heading: 'Registering & Using Decorators',
        code: `import Server from 'tinny-backend';

const server = new Server({ port: 3000 });

// 1. Decorate with a database connection pool
const dbPool = {
  query: async (sql: string) => [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
};
server.decorate('db', dbPool);

// 2. Decorate with app configuration
server.decorate('config', {
  jwtSecret: process.env.JWT_SECRET || 'supersecret',
  env: 'production'
});

// 3. Access decorator inside route handlers
server.add({
  method: 'GET',
  path: '/api/users',
  handler: async (req, res) => {
    const db = req.server.useDecorator('db')?.data;
    const users = await db.query('SELECT * FROM users');
    res.send(200, { users });
  }
});

server.listen();`,
        codeLang: 'typescript'
      }
    ]
  },
  {
    id: 'testing-reliability',
    category: 'Reliability & Testing',
    title: 'Testing & Reliability Suite',
    iconName: 'TestTube',
    description: 'Ensure 100% reliability with automated tests using Vitest and Bun Test.',
    content: [
      {
        heading: 'Reliability Philosophy',
        text: 'tinny-backend is verified with a comprehensive 21-test automated suite covering all HTTP verbs, parameter extraction, regex compilation, query parsing, middleware chains, cookie states, static file serving, and WebSocket connections.'
      },
      {
        callout: {
          type: 'important',
          title: 'Port Collision Prevention',
          text: 'When testing multiple suites in parallel, avoid hardcoding port 3000. Use a dynamic port generator helper like getNextPort() to assign a unique port to each test server.'
        }
      },
      {
        heading: 'Writing Integration Tests with Vitest / Bun Test',
        code: `import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Server from 'tinny-backend';

describe('User API Integration Test', () => {
  let server: Server;
  let testPort = 4501;

  beforeAll(async () => {
    server = new Server({ port: testPort, hostname: '127.0.0.1' });

    server.add({
      method: 'GET',
      path: '/api/users/:id',
      handler: (req, res) => {
        res.send(200, { id: req.params.id, name: 'John Doe' });
      }
    });

    await new Promise<void>((resolve) => server.listen(() => resolve()));
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.getHttpServer().close(() => resolve()));
  });

  it('GET /api/users/:id returns 200 with extracted parameter', async () => {
    const res = await fetch(\`http://127.0.0.1:\${testPort}/api/users/99\`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ id: '99', name: 'John Doe' });
  });
});`,
        codeLang: 'typescript',
        codeFilename: 'user.spec.ts'
      },
      {
        heading: 'Running Framework Tests',
        text: 'Run the complete test suite with Vitest or Bun:'
      },
      {
        code: `# Run tests with Vitest
bun run test

# Run tests with Bun Test runner
bun test src/test/framework.spec.ts`,
        codeLang: 'bash'
      }
    ]
  },
  {
    id: 'recipes',
    category: 'Real-World Recipes',
    title: 'How-To Guides & Recipes',
    iconName: 'BookOpen',
    description: 'Production-ready code recipes for REST APIs, JWT authentication, SPAs, and WebSocket chat.',
    content: [
      {
        heading: 'Recipe 1: Production RESTful CRUD API',
        text: 'A complete RESTful API implementation with in-memory persistence and status codes:',
        code: `import Server from 'tinny-backend';

interface Article {
  id: string;
  title: string;
  content: string;
}

const articles: Map<string, Article> = new Map();
const server = new Server({ port: 3000 });

// GET /api/articles - List all
server.add({
  method: 'GET',
  path: '/api/articles',
  handler: (req, res) => {
    res.send(200, Array.from(articles.values()));
  }
});

// POST /api/articles - Create
server.add({
  method: 'POST',
  path: '/api/articles',
  handler: (req, res) => {
    const { title, content } = req.body || {};
    if (!title || !content) {
      return res.send(400, { error: 'Missing title or content' });
    }
    const id = Date.now().toString();
    const article = { id, title, content };
    articles.set(id, article);
    res.send(201, article);
  }
});

// GET /api/articles/:id - Retrieve
server.add({
  method: 'GET',
  path: '/api/articles/:id',
  handler: (req, res) => {
    const article = articles.get(req.params.id);
    if (!article) return res.send(404, { error: 'Article not found' });
    res.send(200, article);
  }
});

// DELETE /api/articles/:id - Remove
server.add({
  method: 'DELETE',
  path: '/api/articles/:id',
  handler: (req, res) => {
    if (!articles.has(req.params.id)) return res.send(404, { error: 'Article not found' });
    articles.delete(req.params.id);
    res.send(204);
  }
});

server.listen();`,
        codeLang: 'typescript'
      },
      {
        heading: 'Recipe 2: Cookie-Based Authentication Flow',
        text: 'A clean authentication pattern storing tokens in cookies with verification middleware:',
        code: `import Server, { ServerReq, ServerRes } from 'tinny-backend';

const server = new Server({ port: 3000 });

// Auth verification middleware
const requireAuth = (req: ServerReq, res: ServerRes) => {
  const session = res.getCookie('auth_session');
  if (!session || session.value !== 'valid_token_secret') {
    return res.send(401, { error: 'Unauthorized: Please log in first' });
  }
};

// Login Route
server.add({
  method: 'POST',
  path: '/api/auth/login',
  handler: (req, res) => {
    const { username, password } = req.body || {};
    if (username === 'admin' && password === 'tinny123') {
      res.addCookie('auth_session', 'valid_token_secret');
      return res.send(200, { message: 'Login successful' });
    }
    res.send(401, { error: 'Invalid credentials' });
  }
});

// Logout Route
server.add({
  method: 'POST',
  path: '/api/auth/logout',
  handler: (req, res) => {
    res.setCookie('auth_session', '');
    res.send(200, { message: 'Logged out' });
  }
});

// Protected Profile Route
server.add({
  method: 'GET',
  path: '/api/profile',
  middelWares: [requireAuth],
  handler: (req, res) => {
    res.send(200, { user: 'admin', role: 'Superuser' });
  }
});

server.listen();`,
        codeLang: 'typescript'
      },
      {
        heading: 'Recipe 3: Real-Time Multi-Room WebSocket Server',
        text: 'Broadcast messages to room subscribers over WebSockets:',
        code: `import Server from 'tinny-backend';
import { WebSocket } from 'ws';

const server = new Server({ port: 8080 });
const wss = server.createWsServer().getWsServer();

interface ClientWithRoom extends WebSocket {
  room?: string;
}

wss.on('connection', (ws: ClientWithRoom) => {
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'JOIN_ROOM') {
        ws.room = msg.room;
        ws.send(JSON.stringify({ type: 'JOINED', room: ws.room }));
      } else if (msg.type === 'CHAT' && ws.room) {
        // Broadcast to everyone in this room
        wss.clients.forEach((client: ClientWithRoom) => {
          if (client.readyState === WebSocket.OPEN && client.room === ws.room) {
            client.send(JSON.stringify({
              type: 'MESSAGE',
              room: ws.room,
              text: msg.text,
              time: Date.now()
            }));
          }
        });
      }
    } catch (err) {
      ws.send(JSON.stringify({ error: 'Malformed message' }));
    }
  });
});

server.listen();`,
        codeLang: 'typescript'
      }
    ]
  },
  {
    id: 'futures',
    category: 'Roadmap & RFCs',
    title: 'Futures & Framework Roadmap',
    iconName: 'Sparkles',
    description: 'Upcoming architecture improvements, Radix Tree routing RFC, and next-generation features.',
    badge: 'RFCs',
    content: [
      {
        heading: 'Next-Gen Architecture Roadmap',
        text: 'As tinny-backend evolves towards version 2.0, several high-impact architectural enhancements and Request for Comments (RFCs) are in design:'
      },
      {
        table: {
          headers: ['Initiative / RFC', 'Status', 'Target Version', 'Impact & Motivation'],
          rows: [
            ['Radix Tree Router', 'RFC In Review', 'v1.2.0', 'Replace linear regex loop with O(k) prefix tree matching for 10x throughput with 100+ routes'],
            ['Async Onion Middleware', 'RFC Drafted', 'v1.3.0', 'Koa-style await next() cascading middleware pipeline allowing before/after response wrapping'],
            ['Body Stream Processing', 'Planning', 'v1.3.0', 'Stream multipart/form-data and large file uploads directly to disk without memory buffering'],
            ['Native CORS Plugin', 'RFC Accepted', 'v1.2.0', 'First-party CORS helper with origin whitelisting, preflight OPTIONS, and header configuration'],
            ['Native TLS & HTTP/2', 'RFC Planning', 'v2.0.0', 'Support http2.createSecureServer() with ALPN negotiation for HTTP/2 multiplexing'],
            ['OpenAPI Spec Generator', 'Community RFC', 'v2.0.0', 'Auto-generate OpenAPI 3.1 Swagger specifications and interactive documentation from routes']
          ]
        }
      },
      {
        heading: 'RFC 001: Radix Tree Router Engine',
        text: 'Current route resolution iterates through an array of compiled Regular Expressions. For applications with 50+ routes, a Radix Tree (compact trie) lookup guarantees deterministic O(k) routing where k is the length of the path segment, drastically minimizing CPU overhead under high concurrent load.'
      },
      {
        heading: 'RFC 002: Async Onion Middleware Pipeline',
        text: 'Enhance middleware chaining to allow bidirectional wrapping:',
        code: `// Proposed v2 syntax:
server.use(async (req, res, next) => {
  const start = performance.now();
  await next(); // Pass control down the pipeline
  const duration = performance.now() - start;
  res.setHeader('X-Response-Time', \`\${duration.toFixed(2)}ms\`);
});`,
        codeLang: 'typescript'
      },
      {
        heading: 'RFC 003: First-Party CORS Plugin',
        text: 'Simplify Cross-Origin Resource Sharing with a clean plugin API:',
        code: `import { cors } from 'tinny-backend/plugins';

server.use(cors({
  origin: ['https://example.com', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));`,
        codeLang: 'typescript'
      }
    ]
  },
  {
    id: 'interactive-tools',
    category: 'Interactive Tools',
    title: 'Interactive Playground & Tools',
    iconName: 'Play',
    description: 'Experiment live with the route matcher, parameter extractor, and cookie state simulator.',
    content: [
      {
        heading: 'Live Route & Parameter Matcher',
        text: 'Enter any route definition with parameters (:id, :slug, etc.) and test real-time URL matching:',
        customComponent: 'route-tester'
      },
      {
        heading: 'Response Cookie Simulator',
        text: 'Interact with the cookie storage and see how headers are generated in real-time:',
        customComponent: 'cookie-simulator'
      }
    ]
  },
  {
    id: 'author',
    category: 'About & Maintainer',
    title: 'Author & Maintainer',
    iconName: 'User',
    description: 'Meet Yassine Ajagrou (@iaceene), creator and core architect of tinny-backend.',
    badge: 'Maintainer',
    content: [
      {
        customComponent: 'author-profile'
      }
    ]
  }
];
