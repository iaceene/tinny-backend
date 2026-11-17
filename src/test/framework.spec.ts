import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Server, { createServer } from "../index.js";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { WebSocket } from "ws";

describe("tinny-backend Framework Test Suite", () => {
    let testPort = 3910;
    const getNextPort = () => ++testPort;

    describe("Server Initialization & Config", () => {
        it("should initialize with default options", () => {
            const server = new Server({});
            expect(server.getHost()).toBe("localhost");
            expect(server.getPort()).toBe(3000);
            expect(server.getReqCount()).toBe(0);
            expect(server.getUpTime()).toBeGreaterThan(0);
            expect(server.getMethodHandlers()).toEqual([]);
            expect(server.getDecorators()).toEqual([]);
        });

        it("should accept custom options via constructor and createServer helper", () => {
            const server = createServer({
                hostname: "127.0.0.1",
                port: 8080,
                ServerName: "CustomApp"
            });
            expect(server.getHost()).toBe("127.0.0.1");
            expect(server.getPort()).toBe(8080);
        });

        it("should record and retrieve server logs", () => {
            const server = new Server({});
            server.log("Test log entry", "message");
            server.log("Test error entry", "error");
            const logs = server.getLogs();
            expect(logs.length).toBeGreaterThanOrEqual(2);
            expect(logs.some(l => l.message === "Test log entry" && l.type === "message")).toBe(true);
            expect(logs.some(l => l.message === "Test error entry" && l.type === "error")).toBe(true);
        });
    });

    describe("Routing & HTTP Methods", () => {
        let server: Server;
        let port: number;

        beforeAll(async () => {
            port = getNextPort();
            server = new Server({ port, hostname: "127.0.0.1" });

            server.add({
                method: "GET",
                path: "/api/hello",
                handler: (req, res) => {
                    res.send(200, { message: "hello world" });
                }
            });

            server.add({
                method: "POST",
                path: "/api/echo",
                handler: (req, res) => {
                    res.send(201, { received: req.body });
                }
            });

            server.add({
                method: "PUT",
                path: "/api/items/:id",
                handler: (req, res) => {
                    res.send(200, { updatedId: req.params.id, body: req.body });
                }
            });

            server.add({
                method: "DELETE",
                path: "/api/items/:id",
                handler: (req, res) => {
                    res.send(204);
                }
            });

            await new Promise<void>((resolve) => server.listen(() => resolve()));
        });

        afterAll(async () => {
            await new Promise<void>((resolve) => server.getHttpServer().close(() => resolve()));
        });

        it("GET /api/hello returns 200 with JSON payload", async () => {
            const res = await fetch(`http://127.0.0.1:${port}/api/hello`);
            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data).toEqual({ message: "hello world" });
        });

        it("POST /api/echo receives and echoes JSON body", async () => {
            const res = await fetch(`http://127.0.0.1:${port}/api/echo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Tinny", rating: 5 })
            });
            expect(res.status).toBe(201);
            const data = await res.json();
            expect(data).toEqual({ received: { name: "Tinny", rating: 5 } });
        });

        it("PUT /api/items/:id correctly extracts route params", async () => {
            const res = await fetch(`http://127.0.0.1:${port}/api/items/42`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "Updated Item" })
            });
            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data).toEqual({ updatedId: "42", body: { title: "Updated Item" } });
        });

        it("DELETE /api/items/:id returns 204", async () => {
            const res = await fetch(`http://127.0.0.1:${port}/api/items/99`, {
                method: "DELETE"
            });
            expect(res.status).toBe(204);
        });

        it("Non-existent route triggers default 404 handler", async () => {
            const res = await fetch(`http://127.0.0.1:${port}/api/does-not-exist`);
            expect(res.status).toBe(404);
            const data = await res.json();
            expect(data).toEqual({ status: "Page not found" });
        });
    });

    describe("Query Parameters & Trailing Slashes", () => {
        let server: Server;
        let port: number;

        beforeAll(async () => {
            port = getNextPort();
            server = new Server({ port, hostname: "127.0.0.1" });

            server.add({
                method: "GET",
                path: "/search",
                handler: (req, res) => {
                    res.send(200, {
                        queries: req.queries,
                        limit: req.Query.get("limit")
                    });
                }
            });

            await new Promise<void>((resolve) => server.listen(() => resolve()));
        });

        afterAll(async () => {
            await new Promise<void>((resolve) => server.getHttpServer().close(() => resolve()));
        });

        it("should parse query string into req.Query and req.queries", async () => {
            const res = await fetch(`http://127.0.0.1:${port}/search?q=framework&limit=10&sort=desc`);
            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.queries).toEqual({ q: "framework", limit: "10", sort: "desc" });
            expect(data.limit).toBe("10");
        });

        it("should handle trailing slash normalization", async () => {
            const res = await fetch(`http://127.0.0.1:${port}/search/`);
            expect(res.status).toBe(200);
        });
    });

    describe("Middleware & Chaining Execution Order", () => {
        let server: Server;
        let port: number;

        beforeAll(async () => {
            port = getNextPort();
            server = new Server({ port, hostname: "127.0.0.1" });

            // Global middleware
            server.use((req, res) => {
                if (req.ReqUrl?.pathname === "/global-intercept") {
                    res.send(200, { interceptedBy: "global" });
                }
            });

            // Route-level middleware chain
            const step1 = (req: any) => {
                req.customSteps = ["step1"];
            };
            const step2 = (req: any) => {
                req.customSteps.push("step2");
            };
            const blocker = (req: any, res: any) => {
                if (req.Query.get("block") === "true") {
                    res.send(403, { error: "Forbidden by middleware" });
                }
            };

            server.add({
                method: "GET",
                path: "/flow",
                middelWares: [step1, step2, blocker],
                handler: (req: any, res) => {
                    req.customSteps.push("handler");
                    res.send(200, { steps: req.customSteps });
                }
            });

            await new Promise<void>((resolve) => server.listen(() => resolve()));
        });

        afterAll(async () => {
            await new Promise<void>((resolve) => server.getHttpServer().close(() => resolve()));
        });

        it("executes route middlewares sequentially before handler", async () => {
            const res = await fetch(`http://127.0.0.1:${port}/flow`);
            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.steps).toEqual(["step1", "step2", "handler"]);
        });

        it("route middleware can halt request execution before handler", async () => {
            const res = await fetch(`http://127.0.0.1:${port}/flow?block=true`);
            expect(res.status).toBe(403);
            const data = await res.json();
            expect(data.error).toBe("Forbidden by middleware");
        });

        it("global middleware can intercept and respond", async () => {
            const res = await fetch(`http://127.0.0.1:${port}/global-intercept`);
            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.interceptedBy).toBe("global");
        });
    });

    describe("Cookie Management", () => {
        let server: Server;
        let port: number;

        beforeAll(async () => {
            port = getNextPort();
            server = new Server({ port, hostname: "127.0.0.1" });

            server.add({
                method: "GET",
                path: "/set-cookies",
                handler: (req, res) => {
                    res.addCookie("session_id", "xyz123");
                    res.addCookie("theme", "dark");
                    res.setCookie("theme", "dracula");
                    res.send(200, {
                        cookies: res.getAllCookies(),
                        sessionId: res.getCookie("session_id")
                    });
                }
            });

            server.add({
                method: "GET",
                path: "/read-cookies",
                handler: (req, res) => {
                    const authCookie = res.getCookie("authToken");
                    res.send(200, {
                        receivedCookie: authCookie,
                        all: res.getAllCookies()
                    });
                }
            });

            await new Promise<void>((resolve) => server.listen(() => resolve()));
        });

        afterAll(async () => {
            await new Promise<void>((resolve) => server.getHttpServer().close(() => resolve()));
        });

        it("allows adding, mutating, and reading cookies on response", async () => {
            const res = await fetch(`http://127.0.0.1:${port}/set-cookies`);
            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.sessionId).toEqual({ key: "session_id", value: "xyz123" });
            expect(data.cookies).toContain("session_id=xyz123;");
            expect(data.cookies).toContain("theme=dracula;");
        });

        it("parses incoming cookie headers from client", async () => {
            const res = await fetch(`http://127.0.0.1:${port}/read-cookies`, {
                headers: {
                    Cookie: "authToken=secret-token; guest=0"
                }
            });
            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.receivedCookie).toEqual({ key: "authToken", value: "secret-token" });
        });
    });

    describe("Decorators (Dependency Injection)", () => {
        it("registers and retrieves custom state / dependencies", () => {
            const server = new Server({});
            const mockDb = { query: () => ["row1", "row2"] };
            server.decorate("db", mockDb);
            server.decorate("apiKey", "super-secret");

            const dbDec = server.useDecorator("db");
            const keyDec = server.useDecorator("apiKey");
            const missing = server.useDecorator("non_existent");

            expect(dbDec?.data).toBe(mockDb);
            expect(keyDec?.data).toBe("super-secret");
            expect(missing).toBeUndefined();
        });
    });

    describe("File & Directory Serving", () => {
        let server: Server;
        let port: number;
        let tempDir: string;
        let testFilePath: string;

        beforeAll(async () => {
            port = getNextPort();
            server = new Server({ port, hostname: "127.0.0.1" });

            tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "tinny-static-"));
            testFilePath = path.join(tempDir, "sample.txt");
            await fs.writeFile(testFilePath, "Hello static file serving!", "utf8");

            const subDir = path.join(tempDir, "sub");
            await fs.mkdir(subDir);
            await fs.writeFile(path.join(subDir, "app.js"), "console.log('tinny');", "utf8");
            await fs.writeFile(path.join(tempDir, "index.html"), "<h1>Index Page</h1>", "utf8");

            server.add({
                method: "GET",
                path: "/direct-file",
                handler: (req, res) => {
                    return res.sendFile(testFilePath, 200);
                }
            });

            await server.servDir(tempDir, "/static", "index.html");

            await new Promise<void>((resolve) => server.listen(() => resolve()));
        });

        afterAll(async () => {
            await new Promise<void>((resolve) => server.getHttpServer().close(() => resolve()));
            await fs.rm(tempDir, { recursive: true, force: true });
        });

        it("serves a single file with correct MIME type via res.sendFile", async () => {
            const res = await fetch(`http://127.0.0.1:${port}/direct-file`);
            expect(res.status).toBe(200);
            expect(res.headers.get("content-type")).toBe("text/plain");
            const text = await res.text();
            expect(text).toBe("Hello static file serving!");
        });

        it("serves directory files recursively via server.servDir", async () => {
            const res = await fetch(`http://127.0.0.1:${port}/static/sub/app.js`);
            expect(res.status).toBe(200);
            expect(res.headers.get("content-type")).toBe("text/javascript");
            const text = await res.text();
            expect(text).toBe("console.log('tinny');");
        });

        it("serves entryPointFile at directory prefix root", async () => {
            const res = await fetch(`http://127.0.0.1:${port}/static`);
            expect(res.status).toBe(200);
            expect(res.headers.get("content-type")).toBe("text/html");
            const text = await res.text();
            expect(text).toBe("<h1>Index Page</h1>");
        });

        it("returns 404 for missing static file", async () => {
            const res = await fetch(`http://127.0.0.1:${port}/static/not-here.png`);
            expect(res.status).toBe(404);
        });
    });

    describe("WebSocket Integration", () => {
        let server: Server;
        let port: number;

        beforeAll(async () => {
            port = getNextPort();
            server = new Server({ port, hostname: "127.0.0.1" });
            const wss = server.createWsServer().getWsServer();

            wss.on("connection", (ws) => {
                ws.on("message", (msg) => {
                    const text = msg.toString();
                    ws.send(`Echo: ${text}`);
                });
            });

            await new Promise<void>((resolve) => server.listen(() => resolve()));
        });

        afterAll(async () => {
            await new Promise<void>((resolve) => server.getHttpServer().close(() => resolve()));
        });

        it("establishes a WebSocket connection and echoes messages", async () => {
            const ws = new WebSocket(`ws://127.0.0.1:${port}`);
            
            await new Promise<void>((resolve, reject) => {
                ws.on("open", () => resolve());
                ws.on("error", (err) => reject(err));
            });

            const replyPromise = new Promise<string>((resolve) => {
                ws.on("message", (data) => resolve(data.toString()));
            });

            ws.send("Hello Tinny WS");
            const reply = await replyPromise;
            expect(reply).toBe("Echo: Hello Tinny WS");

            ws.close();
        });
    });
});
