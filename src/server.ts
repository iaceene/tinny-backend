import { randomBytes } from "crypto"
import fs from "fs"
import path, { join } from "path"
import * as http from "http"
import * as net from "net"
import { fileURLToPath } from 'url';
import { readdir } from 'node:fs/promises';
import * as os from "node:os";


export type HandlerFun = (req: ServerReq, res: ServerRes)=>void 

export type AddOption = {
    method: Methods,
    path: string,
    handler: HandlerFun,
    middelWares?: HandlerFun[],
    next?: HandlerFun
}

export type Logs = {
    message: string,
    type: "message" | "error",
    date: string
}

export type LoginOpt = {
    username: string,
    password: string
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
    DefaultHandler?: HandlerFun
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

    async servDir(DIR: string, pref: string){
        const files = await this.readDir(DIR, pref)
        if (!files){
            this.log("Failed to serve this dir", "error")
            return;
        }

        for (let i = 0; i < files.files.length; i++){
            const filename = files.files[i]?.FileName;
            const prefix = files.files[i]?.prefix;
            if (!filename || !prefix)
                break;
            if (path.basename(filename).startsWith("index")){
                    this.add({
                    method: "GET",
                    path: `/${path.dirname(prefix)}`,
                    handler: (req: ServerReq, res: ServerRes)=>{
                        this.SendFile(res, filename, 200)
                        return
                    }
                    }) 
                    this.log(`serving ${filename} as default file`)
            }
            this.add({
                method: "GET",
                path: `/${prefix}`,
                handler: (req: ServerReq, res: ServerRes)=>{
                    this.SendFile(res, filename, 200)
                    return
                }
            })
        }

    }

    SendFile(res: ServerRes, FILE: string, status: number){
        const __filename = fileURLToPath(import.meta.url);
        const projectRoot = path.resolve(__filename, '..', '..');
        const __dirname = projectRoot;
        const filePath = path.join(__dirname, FILE)
        const extName = String(path.extname(filePath)).toLowerCase()
        const mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.json': 'application/json'
        };
        const contentType = (mimeTypes as any)[extName] || 'application/octet-stream';
        fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            const errorPagePath = path.join(__dirname, 'public', '404.html');
            res.server.log(`cannot found this ${FILE}, to send ${res.socket?.localAddress}`, "error")
            res.sendFile(404, 'text/html', {
                PATH: errorPagePath
            })
        } else
            res.server.log(`sending file ${FILE} to ${res.socket?.localAddress}`, (status == 404 || status == 401) ? "error" : "message")
            res.sendFile(status, contentType, {
                PATH : filePath
            })
    });
    }

    log(message: string, type?: "error" | "message"){
        if (this.logs.length > 100)
            this.logs.shift()
        this.logs.push({
                            message,
                            type: type ?? "message",
                            date: new Date().toDateString()
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
        this.defaultHandler = args.DefaultHandler ?? ((req: ServerReq, res: ServerRes)=> {
                this.SendFile(res, "public/404.html", 404);
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

            req.on("end", ()=>{
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

                (res as ServerRes).sendFile = (status: number, ContentType: string, data?: any, headers?: Headers)=>{
                    if (!(res as ServerRes).isClosed){
                        fs.readFile(data.PATH, (err, fileData) => {
                            if ((res as ServerRes).isClosed)
                                return
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'text/plain' });
                                res.end('500 - Internal Error or File Not Found');
                                return;
                            }
                            const cookies = (res as ServerRes).getAllCookies();
                            const headerObj: any = { 'Content-Type': ContentType, ...headers };
                            if (cookies.length > 0)
                                headerObj['Set-Cookie'] = cookies;
                            res.writeHead(status, headerObj);
                            res.end(fileData);
                            (res as ServerRes).isClosed = true;
                        });
                    } else {
                        this.log(`Multipple replays on ${req.url}`, "error")
                    }
                }

                (req as ServerReq).body = body ? JSON.parse(body) : null
                let handlersCount = 0
                for(let i = 0; i < this.methodHandler.length; i++){
                    if (this.methodHandler[i]?.method == req.method 
                        && this.methodHandler[i]?.path == req.url
                    ){
                        if (this.methodHandler[i]?.middelWares)
                            this.methodHandler[i]?.middelWares?.forEach((middelware) => middelware((req as ServerReq), (res as ServerRes)))
                        if (!(res as ServerRes).isClosed)
                            this.methodHandler[i]?.handler(req, res);
                        const nextFn = this.methodHandler[i]?.next
                        if (typeof nextFn === "function")
                            nextFn((req as ServerReq), (res as ServerRes))
                        handlersCount++
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

    monitor(server: Server, username: string, password: string){

        const isAuthed = (req: ServerReq, res: ServerRes): boolean =>{
            const key = res.getCookie("adminkey")
            if (!key || (key as any).value !== "yassine")
                return false
            return true
        }

        const Auth = (req: ServerReq, res: ServerRes)=>{
            if (!isAuthed(req, res)){
                // console.log("user not authed")
                // return server.SendFile(res, "public/401.html", 401)
                return res.send(401, {
                    "Error": "not authed"
                })
            }
        }

        server.add({
            method: "GET",
            handler: (req: ServerReq, res: ServerRes) =>{
                        if (isAuthed(req, res))
                            server.SendFile(res, "public/page/index.html", 200)
                        else
                            server.SendFile(res, "public/login/index.html", 200)
                    },
            path: "/" 
        })
        server.add({
            method: "GET",
            handler: (req: ServerReq, res: ServerRes) =>{
                        server.SendFile(res, "public/login/css/style.css", 200)
                    },
            path: "/css/style.css" 
        })
        server.add({
            method: "GET",
            middelWares: [Auth],
            handler: (req: ServerReq, res: ServerRes) =>{
                        server.SendFile(res, "public/page/index.html", 200)
                    },
            path: "/admin" 
        })

        server.add({
            method: "POST",
            handler: (req: ServerReq, res: ServerRes) => {
                if (!req.body.username || req.body.username !== username || !req.body.password || req.body.password !== password){
                        res.send(403, {"Error" : "Access Denied"})
                        return
                }
                res.addCookie("adminkey", "yassine")
                res.send(200, { "name": `${req.body.username}`, "password": `${req.body.password}` })
            },
            path: "/api/login" 
        })

        server.add({
            method: "GET",
            middelWares: [Auth],
            path: "/admin/status",
            handler: async (req: ServerReq, res: ServerRes) => {
                res.send(200, {
                    "Machin uptime": `${Math.floor(os.uptime() / 86400)}d ${Math.floor((os.uptime() % 86400) / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m`,
                    "Server uptime": `${Math.floor((Date.now() - this.uptime) / 86400)}d ${Math.floor(((Date.now() - this.uptime) % 86400) / 3600)}h ${Math.floor(((Date.now() - this.uptime) % 3600) / 60)}m`,
                    "Arch" : os.arch(),
                    "Platform" : os.platform(),
                    "Memory" : `${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB`,
                    "Used Memory" : `${((os.totalmem() - os.freemem()) / (1024 ** 3)).toFixed(2)} GB`,
                    "Free Memory" : `${(os.freemem() / (1024 ** 3)).toFixed(2)} GB`,
                    "Cpu" : os.cpus()[0],
                    "Connected clients" : this.sessions.length,
                    "Total requests" : this.reqCount,
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


        server.listen(false, ()=>{
            console.log(`Monitor start listening in http://${this.hostname}:${this.PORT + 1}`)
        })
    }

    listen(enableMon?: boolean, callback?: () => void, login?: LoginOpt){
        if (enableMon)
            this.monitor(new Server({port: this.PORT + 1}), login?.username ?? "admin", login?.password ?? "password");
        this.server.listen(this.PORT, callback ?? (()=>{
            console.log(`Server start listening in http://${this.hostname}:${this.PORT}`)
        }))
    }
}
