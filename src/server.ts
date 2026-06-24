import { randomBytes } from "crypto"
import fs from "fs"
import path, { join } from "path"
import * as http from "http"
import * as net from "net"
import { fileURLToPath } from 'url';
import { readdir } from 'node:fs/promises';
import * as os from "node:os";
import * as JWT from "jsonwebtoken"
import * as DOTENV from "dotenv"


export type HandlerFun = (req: ServerReq, res: ServerRes)=>void | Promise<void>

export type AddOption = {
    method: Methods,
    path: string,
    handler: HandlerFun,
    middelWares?: HandlerFun[] | undefined,
    next?: HandlerFun
}

export type Logs = {
    message: string,
    type: "message" | "error",
    date: string
}

export type Headers = {
    key: string,
    value: string
}

export type Cookie = {
    key: string,
    value: string
}

export type ServerOptions = {
    port?: number,
    hostname?: string,
    reqPerMinute?: number,
    DefaultHandler?: HandlerFun,
    ServerName?: string
}

export type ServerReq = http.IncomingMessage & {
    body?: any,
    server: Server
}

export type ServFiles = {
    FileName: string,
    prefix: string
}

export type DirFiles = {
    files: ServFiles[]
}

export type ServerRes = http.ServerResponse & {
    body?: any
    send: (status: number, data?: any, headers?: Headers)=>void,
    sendFile: (status: number, ContentType: string, data?: any, headers?: Headers)=>void,
    isClosed: boolean,
    server: Server
    coockie: (key: string, value: string)=>string
    getAllCookies: () => string[]
    setCookie: (name: string, value: string) => void
    getCookie: (name: string) => Cookie | null
    addCookie: (name: string, value: string) => void
}

export type Methods = "POST" | "GET" | "PUT" | "DELETE"

export type Handlers = {
    method: Methods,
    path: string,
    handler: Function
    middelWares?: HandlerFun[] | undefined
    next?: HandlerFun  | undefined
}

export type Decorator = {
    name: string,
    data: any
}

export type Session = {
    ip: string
    lastReq: number
    reqCount: number
    key: string,
    banInterval: number
}

export type AdminSessions = {
    id: number,
    ip: string,
    userAgent: string,
    creation: number,
    isValid: boolean,
    request: number
}

export const colors = {
    reset: '\x1b[0m',
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
};


export default class Server {
    private PORT: number
    private hostname: string
    private methodHandler: Handlers[]
    private decorators: Decorator[]
    private server
    private sessions: Session[]
    private uptime: number
    private reqCount: number
    private logs: Logs[]
    private ServerName: string
    private defaultHandler: HandlerFun

    private generateKey(): string{
        return randomBytes(16).toString('hex')
    }

    private generateSession(ip: string): Session{
        const session = {
            ip,
            lastReq: Date.now(),
            reqCount: 0,
            key: this.generateKey(),
            banInterval: 60000
        }
        this.sessions.push(session)
        return session
    }

    private getSession(ip: string): Session | undefined{
        return this.sessions.filter((ses)=> ses.ip === ip)[0]
    }

    getHost(){
        return this.hostname
    }

    getPort(){
        return this.PORT
    }

    add(opt: AddOption){
        this.methodHandler.push({
            method: opt.method,
            handler: opt.handler,
            path : opt.path.replace(/(?<=.)\/+$/, ""),
            middelWares: opt.middelWares,
            next: opt.next
        })
    }

    decorate(name: string, data: any){
        this.decorators.push({
            name,
            data
        })
    }

    useDecorator(name: string){
        if (this.decorators.length == 0) return null
        return this.decorators.filter((dec) => dec.name === name)[0]
    }

    async readDir(DIR: string, prefix: string): Promise<DirFiles | null>{
        try {
            const entries = await readdir(DIR, { recursive: true, withFileTypes: true });
            const result: DirFiles = {files: []};

            for (const entry of entries)
                if (!entry.isDirectory())
                    result.files.push({ FileName: join(entry.parentPath, entry.name), prefix :  join(prefix, entry.name) })
            return result;
        } 
        catch (error) {
            this.log(`Error reading directory: ${DIR} error ${error}`, "error");
        }
        return null;
    }

    async servDir(DIR: string, pref: string, middelWares?: HandlerFun[]){
        let files: DirFiles | null = null
        try {
            files = await this.readDir(DIR, pref)
            
        } catch {
            this.log("an error happens when try to server a dir", "error")
        }
        if (!files){
            this.log("Failed to serve this dir", "error")
            return;
        }

        let index = false;
        for (let i = 0; i < files.files.length; i++){
            const filename = files.files[i]?.FileName;
            const prefix = files.files[i]?.prefix;
            if (!filename || !prefix)
                break;
            if ((path.basename(filename).startsWith("index") && path.dirname(filename) == DIR.replace(/\.\//g, '')) && !index){
                    this.log(
                        `setting ${filename} as default page for ${DIR}`
                    )
                    this.add({
                        method: "GET",
                        path: `/${path.dirname(prefix)}`,
                        handler: (req: ServerReq, res: ServerRes)=>{
                            this.SendFile(res, filename, 200)
                            return
                        },
                        middelWares
                    })
                    index = true;
            }
            this.add({
                method: "GET",
                path: `/${prefix}`,
                handler: async (req: ServerReq, res: ServerRes)=>{
                    await this.SendFile(res, filename, 200)
                    return
                },
                middelWares
            })
        }
        if (!index){
            this.add({
                method: "GET",
                path: `/${pref}`,
                handler: async (req: ServerReq, res: ServerRes)=>{
                    res.send(200, {
                        ...files.files.map((file)=> {
                            return {
                                    "name" : path.basename(file.FileName),
                                    "url": `http://${this.hostname}:${this.PORT}/${file.prefix}`
                                }
                        })
                    })
                },
                middelWares
            })
        }
    }

    async SendFile(res: ServerRes, FILE: string, status: number): Promise<void>{
        const __filename = fileURLToPath(import.meta.url);
        const projectRoot = path.resolve(__filename, '..', '..');
        const __dirname = projectRoot;
        const filePath = path.join(__dirname, FILE)
        const extName = String(path.extname(filePath)).toLowerCase()
        const mimeTypes = {
            '.txt': 'text/plain',
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.json': 'application/json',
            '.mp4': 'video/mp4',
            '.webm' : 'video/webm',
            '.ogg' : 'video/ogg',
            '.avi' : 'video/x-msvideo'
        };
        const contentType = (mimeTypes as any)[extName] || 'application/octet-stream';
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            res.server.log(`sending file ${FILE} to ${res.socket?.localAddress}`, (status == 404 || status == 401) ? "error" : "message")
            return res.sendFile(status, contentType, { PATH: filePath });
        } catch {
            const errorPagePath = path.join(__dirname, 'public', '404.html');
            res.server.log(`cannot find ${FILE} to send to ${res.socket?.localAddress}`, "error")
            return res.sendFile(404, 'text/html', { PATH: errorPagePath });
        }
    }

    log(message: string, type?: "error" | "message"){
        const DateObj = new Date();
        const date = `${DateObj.toDateString() + " " + DateObj.toLocaleTimeString()}`
        const newType = type ?? message;

        console.log(`[${colors.green}${date}${colors.reset}]`, 
                `[${colors.yellow}${this.ServerName}${colors.reset}] =>`, 
                `${(type == "error" ? colors.red : colors.white)}${message}${colors.reset}`)

        if (this.logs.length > 100)
            this.logs.shift()
        this.logs.push({
                            message,
                            type: type ?? "message",
                            date
                        });
    }

    constructor(args: ServerOptions){
        this.sessions = []
        this.decorators = []
        this.methodHandler = []
        this.hostname = args.hostname ?? "localhost"
        this.PORT = args.port ?? 3000
        this.uptime = Date.now()
        this.reqCount = 0
        this.logs = []
        this.ServerName = args.ServerName ?? "Server"
        this.defaultHandler = args.DefaultHandler ?? ( async (req: ServerReq, res: ServerRes)=> {
                await this.SendFile(res, "public/404.html", 404);
            })


        this.server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse)=>{
            let body: string = "";
            let cookies: Cookie[] = [];
            this.reqCount++;


            this.log(`a client requested ${req.url}`);
            
            
            (res as ServerRes).isClosed = false;


           
            (res as ServerRes).getCookie = (name: string): Cookie | null => {
                if (cookies.length !== 0)
                    for (let i = 0; i < cookies.length; i++)
                        if (cookies[i]?.key === name)
                            return cookies[i] ?? null
                return null
            }

            (res as ServerRes).setCookie = (name: string, value: string) => {
                for (let i = 0; i < cookies.length; i++)
                    if (name === cookies[i]?.key)
                        (cookies[i] as any).value = value
            }

            (res as ServerRes).addCookie = (name: string, value: string)=>{
                if (name === "" || value === "")
                    return
                if ((res as ServerRes).getCookie(name) != null)
                    return (res as ServerRes).setCookie(name, value);
                cookies.push({ key: name, value })
            }

            (res as ServerRes).getAllCookies = (): string[] => {
                const ArrayBuffer: string[] = []
                for (let i = 0; i < cookies.length; i++)
                    ArrayBuffer.push(`${cookies[i]?.key}=${cookies[i]?.value}; Path=/; SameSite=Lax`)
                return ArrayBuffer
            }

            const setCookies = (cookies: string | undefined)=>{
                if (!cookies || cookies === "")
                    return
                const pairs = cookies.split("; ")
                if (!pairs)
                    return
                for (let i = 0; i < pairs.length; i++)
                    (res as ServerRes).addCookie(pairs[i]?.split("=")[0] ?? "", pairs[i]?.split("=")[1] ?? "")
            }

            setCookies(req.headers["cookie"]);
    

            req.on("data", (chunk)=>{
                body += chunk.toString();
            })

            req.on("end", async ()=>{
                (req as ServerReq).server = this;
                (res as ServerRes).server = this;
                req.url = req.url === "/" ? "/" : req.url?.replace(/(?<=.)\/+$/, "");
                (res as ServerRes).send = (status: number, data?: any, headers?: Headers)=>{
                    if (!(res as ServerRes).isClosed){
                        const cookies = (res as ServerRes).getAllCookies();
                        const headerObj: any = { 'Content-Type': 'application/json', ...headers };
                        if (cookies.length > 0)
                            headerObj['Set-Cookie'] = cookies;
                        res.writeHead(status, headerObj);
                        res.end(data ? JSON.stringify(data) : "");
                        (res as ServerRes).isClosed = true;
                    } else {
                        this.log(`Multipple replays on ${req.url}`, "error")
                    }
                }
 
                (res as ServerRes).sendFile = async (status: number, ContentType: string, data?: any, headers?: Headers)=> {
                    if (!(res as ServerRes).isClosed){
                        try {
                            const fileData = await fs.promises.readFile(data.PATH);
                            if ((res as ServerRes).isClosed)
                                return;
                            const cookies = (res as ServerRes).getAllCookies();
                            const headerObj: any = { 'Content-Type': ContentType, ...headers };
                            if (cookies.length > 0)
                                headerObj['Set-Cookie'] = cookies;
                            res.writeHead(status, headerObj);
                            res.end(fileData);
                            (res as ServerRes).isClosed = true;
                        }
                        catch {
                            if ((res as ServerRes).isClosed)
                                return;
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('500 - Internal Error or File Not Found');
                            return;
                        }
                    }
                    else
                        this.log(`Multipple replays on ${req.url}`, "error");
                }

                (req as ServerReq).body = body ? JSON.parse(body) : null
                let handlersCount = 0
                for(let i = 0; i < this.methodHandler.length; i++){
                    if (this.methodHandler[i]?.method == req.method 
                        && this.methodHandler[i]?.path == req.url
                    ){
                        if (!(res as ServerRes).isClosed) {
                            if (this.methodHandler[i]?.middelWares && typeof this.methodHandler[i]?.middelWares != "undefined") {
                                for (const middelware of this.methodHandler[i]?.middelWares ?? []) {
                                    await middelware((req as ServerReq), (res as ServerRes));
                                    if ((res as ServerRes).isClosed)
                                        break;
                                }
                            }
                            if (!(res as ServerRes).isClosed)
                                await this.methodHandler[i]?.handler(req, res);
                            const nextFn = this.methodHandler[i]?.next
                            if (typeof nextFn === "function")
                                await nextFn((req as ServerReq), (res as ServerRes))
                            handlersCount++
                        }
                    }
                }
                if (!handlersCount){
                    this.defaultHandler((req as ServerReq), (res as ServerRes))
                }
            })
        })
        this.server.on("connection", (socket: net.Socket)=>{
            this.log(`new connention recieved ip ${socket.remoteAddress} on port ${socket.remotePort}`)
            socket.on("close", (hadError: boolean)=>{
                this.log(`client has drop the connection ${socket.remoteAddress}}`, hadError ? "error" : "message")
            })
            socket.on("error", (err: Error)=>{
                this.log(`connection failed with ${socket.remoteAddress}, cause : ${err.message}`, "error")
            })
        })
        this.server.on("close", ()=>{
            this.log(`Server has successfully stopped accepting connections`)
        })
        this.server.on("error", (err: Error)=>{
            this.log(err.message, "error")
        })
    }

    monitor(server: Server){
        DOTENV.config()

        const username: string = process.env.ADMIN_USERNAME || ""
        const password: string = process.env.ADMIN_PASSWORD || ""
        const key: string = process.env.ADMIN_KEY || ""
        const sessions: AdminSessions[] = []

        if (key === "" || username === "" || password === ""){
            server.log(`cannot set ${key === "" ? "ADMIN_KEY" : username === "" ? "ADMIN_USERnAME" : password === "" ? "ADMIN_PASSWORD" : ""} as empty in .env, read tinny-backend doc`, "error");
            return
        }
        
        const isAuthed = (res: ServerRes): boolean =>{
            const TOKEN = res.getCookie("token")
            if (!TOKEN)
                return false
            try {
                const decoded: any = JWT.default.verify(TOKEN.value, key);
                if (typeof sessions[decoded.id] === undefined || !sessions[decoded.id]?.isValid)
                    throw new Error("None valid token");
                (sessions[decoded.id] as AdminSessions).request += 1;
            } catch {
                server.log("a user try to login to admin panel using none valid token", "error")
                return false
            }
            return true
        }

        const Login = async (req: ServerReq, res: ServerRes) => {
            let token

            try {
                if (!req.body.username || req.body.username !== username || !req.body.password || req.body.password !== password)
                    throw new Error("User has entred a none valid cridentials")
                const SESSION_ID = sessions.length === 0 ? 0 : sessions.length + 1
                token = JWT.default.sign({ id: SESSION_ID }, key, { expiresIn: "1h" });
                res.addCookie("token", token)
                sessions.push({
                    id: SESSION_ID,
                    isValid: true,
                    creation: Date.now(),
                    userAgent: req.headers["user-agent"] ?? "DEVICE",
                    ip: req.socket.remoteAddress ?? "UNKNOWN",
                    request: 0
                })
                res.send(200, "./public/admin/index.html")
            }
            catch(err: any) {
                server.log(err.message, "error")
                server.log("A user entred a none valid cridentionl", "error")
                res.send(403, {"Error" : "Access Denied"})
            }
        }

        const Logout = async (req: ServerReq, res: ServerRes) => {
            let payloud: any

            const TOKEN = res.getCookie("token")
            if (!TOKEN)
                return server.SendFile(res, "public/login/index.html", 401)

            try {
                payloud = JWT.default.verify(TOKEN.value, key);
                if (typeof sessions[payloud.id] === "undefined" || !sessions[payloud.id]?.isValid)
                    throw new Error("an Error is happens");
                (sessions[payloud.id] as AdminSessions).isValid = false
                return await  server.SendFile(res, "public/login/index.html", 200)
            }
            catch(err: any) {
                server.log(err.message, "error")
                res.send(403, {"Error" : "Access Denied"})
            }
        }


        const Auth = async (req: ServerReq, res: ServerRes)=>{
            if (!isAuthed(res)){
                if (req.url == "/")
                    return await  server.SendFile(res, "public/login/index.html", 401)
                return await  server.SendFile(res, "public/401.html", 401)
            }
            if (req.url == "/")
                return await server.SendFile(res, "public/admin/index.html", 200)
        }

        server.add({
            method: "POST",
            handler: Login,
            path: "/api/login" 
        })

        server.add({
            method: "GET",
            middelWares: [Auth],
            handler: Logout,
            path: "/api/logout" 
        })

        server.add({
            method: "GET",
            middelWares: [Auth],
            path: "/admin/status",
            handler: async (req: ServerReq, res: ServerRes) => {
                const now: number = Date.now()
                res.send(200, {
                    "Machin uptime": `${Math.floor(os.uptime() / 86400)}d ${Math.floor((os.uptime() % 86400) / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m`,
                    "Server uptime": `${Math.floor((now - this.uptime) / (1000 * 60 * 60 * 24)) % 60}D ${Math.floor((now - this.uptime) / (1000 * 60 * 60)) % 60}H ${Math.floor((now - this.uptime) / (1000 * 60)) % 60}M ${Math.floor((now - this.uptime) / 1000) % 60}S`,
                    "Arch" : os.arch(),
                    "Platform" : os.platform(),
                    "Memory" : `${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB`,
                    "Used Memory" : `${((os.totalmem() - os.freemem()) / (1024 ** 3)).toFixed(2)} GB`,
                    "Free Memory" : `${(os.freemem() / (1024 ** 3)).toFixed(2)} GB`,
                    "Cpu" : os.cpus()[0],
                    "Connected clients" : this.sessions.length,
                    "Total requests" : this.reqCount,
                    "sessions": sessions,
                    "logs" : this.logs
                })
            }
        })

        server.add({
            method: "GET",
            middelWares: [Auth],
            path: "/messages",
            handler: async (req: ServerReq, res: ServerRes) => {
                res.send(200, {
                    "logs" : this.logs
                })
            }
        })

        server.servDir("./public/doc", "docs")
        server.servDir("./public/imgs", "imgs")
        server.servDir("./public/login", "/", [Auth])
        server.servDir("./public/admin", "admin", [Auth])


        server.listen(false)
    }

    listen(enableMon?: boolean, callback?: () => void){
        if (enableMon)
            this.monitor(new Server({port: this.PORT + 1, ServerName: "Monitor"}));
        this.server.listen(this.PORT, callback ?? (()=>{
            this.log(`start listening in http://${this.hostname}:${this.PORT}`)
        }))
    }
}
