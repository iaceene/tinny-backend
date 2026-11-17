#  tinny-backend Documentation

Welcome to the official documentation for **tinny-backend** (v1.1.2), a lightweight, robust, and extensible backend routing framework built on Node.js and Bun.

---

##  Quick Links

- [ Quickstart & Installation](./content/GETTING_STARTED.md)
- [ Routing & Middleware Engine](./content/ROUTING_AND_MIDDLEWARE.md)
- [ Request & Response API Reference](./content/API_REFERENCE.md)
- [ Static File Serving & WebSockets](./content/STATIC_FILES_AND_WEBSOCKETS.md)
- [ Testing & Reliability Suite (21 Tests)](./content/TESTING_AND_RELIABILITY.md)
- [ Real-World Recipes & How-To Guides](./content/RECIPES_AND_HOW_TO.md)
- [ Futures & Next-Gen Roadmap (RFCs)](./content/FUTURES_AND_ROADMAP.md)
- [ Author & Maintainer (Yassine Ajagrou)](./content/AUTHOR.md)

---

##  Interactive Documentation Website

The interactive React documentation website is located inside `docs/`. It includes:

-  **Real-time fuzzy search** with keyboard shortcut `⌘K` / `Ctrl+K`
-  **Live Interactive Route Matcher & Parameter Extractor**
-  **Interactive Cookie State Simulator**
-  **Visual Request-Response Architecture Pipeline**
-  **Dark & Light Mode** with developer aesthetics
-  **One-click copy code snippets** with language tabs

### Build & Deploy to GitHub Pages

To build the static documentation for GitHub Pages:

```bash
# Build the production bundle into docs/dist
bun run docs:build
# or
npm run docs:build
```

### Preview Documentation Locally

To preview the documentation locally (served by `tinny-backend` itself!):

```bash
bun run docs:preview
# or
npm run docs:preview
```

Visit [http://localhost:4000/](http://localhost:4000/) in your browser.
