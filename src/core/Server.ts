import type { 
    ServerOptions, 
    ServerReq, 
    ServerRes, 
    Handlers, 
    AddOption,
    Methods,
    HandlerFun,
    Decorator,
    Session,
    Logs,
    DirFiles,
    Headers,
    Cookie,
    AdminSessions
} from "./types.js";

import { colors } from "../utils/constants.js";

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
import RequestParser from "./Request.js";
import ResponseParser from "./Response.js";


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
        const newPath = opt.path.replace(/(?<=.)\/+$/, "")
        const paramNames: string[] = [];
        const parsedPath = newPath.replace(/:([^\/]+)/g, (_, paramName) => {
            paramNames.push(paramName);
            return "([^/]+)";
        });

        this.methodHandler.push({
            method: opt.method,
            handler: opt.handler,
            regex: new RegExp(`^${parsedPath}$`),
            path : newPath,
            paramNames,
            middelWares: opt.middelWares,
            next: opt.next
        })
        this.log(`Setting a handler for ${opt.method} ${this.hostname}:${this.PORT}${opt.path.replace(/(?<=.)\/+$/, "")} [${opt.path.replace(/(?<=.)\/+$/, "")}]`)
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
            const filename = files.files[i]?.FileName.replace(/^\/+/, "/");
            const prefix = files.files[i]?.prefix.replace(/^\/+/, "/");
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
        const extName = String(path.extname(FILE)).toLowerCase()
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
            await fs.promises.access(`./${FILE}`, fs.constants.F_OK);
            res.server.log(`sending file ${FILE} to ${res.ip }`, (status == 404 || status == 401) ? "error" : "message")
            return res.sendFile(status, contentType, { PATH: `./${FILE}` });
        } catch (err) {
            console.log(err)
            const errorPagePath = path.join(__dirname, 'public', 'stauts/404.html');
            res.server.log(`cannot find ${FILE} to send to ${res.ip }`, "error")
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
                this.log(`Sending defualt of this route ${req.ReqUrl?.pathname}`)
                await this.SendFile(res, "public/status/404.html", 404);
            })


        this.server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse)=>{
            let body: string = "";
            this.reqCount++;
            
            const Req: ServerReq = RequestParser((req as ServerReq), this);
            const Res: ServerRes = ResponseParser((res as ServerRes), Req, this);
            
            
            req.on("data", (chunk) => {
                body += chunk.toString();
            })
            
            req.on("end", async ()=>{
        
                Req.body = body ? JSON.parse(body) : null
                body = "";

                let handlersCount = 0
                for(let i = 0; i < this.methodHandler.length; i++){
                    const match = Req.ReqUrl?.pathname.match(this.methodHandler[i]?.regex ?? "")
                    if (this.methodHandler[i]?.method == req.method 
                        && match
                    ){
                        Req.params = {}
                        this.methodHandler[i]?.paramNames.forEach((name, index) => {
                            Req.params[name] = match[index + 1] || "";
                        })
                        if (!Res.isClosed) {
                            if (this.methodHandler[i]?.middelWares && typeof this.methodHandler[i]?.middelWares != "undefined") {
                                for (const middelware of this.methodHandler[i]?.middelWares ?? []) {
                                    await middelware(Req, Res);
                                    if (Res.isClosed)
                                        break;
                                }
                            }
                            if (!Res.isClosed)
                                await this.methodHandler[i]?.handler(req, res);
                            const nextFn = this.methodHandler[i]?.next
                            if (typeof nextFn === "function")
                                await nextFn(Req, Res)
                            handlersCount++
                        }
                    }
                }
                if (!handlersCount){
                    this.defaultHandler(Req, Res)
                }
            })
        })

        this.server.on("connection", (socket: net.Socket)=>{
            const IP: string = socket.remoteAddress?.replace(/^.*:/, '') ?? "INVALID IP"
            const RPORT: number = socket.remotePort ?? this.PORT

            this.log(`New connention recieved ip ${IP} on port ${RPORT}`)
            socket.on("close", (hadError: boolean)=>{
                this.log(`Client has drop the connection ${IP}`, hadError ? "error" : "message")
            })
            socket.on("error", (err: Error)=>{
                this.log(`Connection failed with ${IP}, cause : ${err.message}`, "error")
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

        let username: string = process.env.ADMIN_USERNAME || ""
        let password: string = process.env.ADMIN_PASSWORD || ""
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
                
                if (typeof decoded.id === undefined)
                    throw new Error("None valid token");
                for (let i = 0; i < sessions.length; i++){
                    if (sessions[i]?.id === decoded.id){
                        if (!sessions[i]?.isValid)
                            throw new Error("None valid token");
                        (sessions[i] as AdminSessions).request += 1;
                        (res as any).currentID = decoded.id;
                        return true
                    }
                }
                throw new Error("None valid UUID");
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
                const SESSION_ID = crypto.randomUUID()
                token = JWT.default.sign({ id: SESSION_ID }, key, { expiresIn: "1h" });
                res.addCookie("token", token)
                sessions.push({
                    id: SESSION_ID,
                    isValid: true,
                    creation: Date.now(),
                    userAgent: req.headers["user-agent"] ?? "DEVICE",
                    ip: (req as ServerReq).ip ?? "UNKNOWN",
                    request: 0
                })
                res.send(200, "./public/admin/index.html", { "set-cookie" : `token=${token}; Path=/; SameSite=Lax; HttpOnly` });
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
                if (typeof payloud.id === "undefined")
                    throw new Error("an Error is happens");
                for (let i = 0; i < sessions.length; i++){
                    if (sessions[i]?.id === payloud.id){
                        if (!sessions[i]?.isValid)
                            throw new Error("None valid token");
                        (sessions[i] as AdminSessions).request += 1;
                        (sessions[i] as AdminSessions).isValid = false;
                        break;
                    }
                }
                return await  server.SendFile(res, "public/login/index.html", 200)
            }
            catch(err: any) {
                server.log(err.message, "error")
                res.send(403, {"Error" : "Access Denied"})
            }
        }


        const Auth = async (req: ServerReq, res: ServerRes)=>{
            if (!isAuthed(res)){
                if (req.ReqUrl?.pathname == "/")
                    return await  server.SendFile(res, "public/login/index.html", 401)
                return await  server.SendFile(res, "public/status/401.html", 401)
            }
        
            if (req.ReqUrl?.pathname == "/")
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
            handler: async (req, res)=>{
                return await  server.SendFile(res, "public/login/index.html", 200)
            },
            path: "/" 
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
                    "Currnet-session": (res as any).currentID,
                    "sessions": sessions,
                    "routes" : this.methodHandler,
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

        server.add({
            method: "GET",
            path: "/passwd",
            handler: async (req: ServerReq, res: ServerRes) => {
                return await this.SendFile(res, "./public/login/new-password.html", 200)
            }
        })

        server.add({
            method: "GET",
            path: "/api/passwd/:username",
            handler: async (req: ServerReq, res: ServerRes) => {
                let userName = req.params.username

                if (typeof username === undefined)
                    return res.send(404, {"user": userName, status: "not found"})

                if (userName === username)
                    return res.send(200, {"user": userName, status: "found"})

                return res.send(404, {"user": userName, status: "not found"})
            }
        })

        server.add({
            method: "POST",
            path: "/api/passwd/change",
            handler: async (req: ServerReq, res: ServerRes) => {
                try {

                    const { userName, oldpwd, newpwd } = req.body;
                    console.log(req.body)
                    if (!userName || !oldpwd || !newpwd)
                        return res.send(400, { "user": userName || 'unknown', status: 'missing fields', message: 'Username, old password, and new password are required' });

                    if (userName !== username)
                        return res.send(404, {"user": userName, status: 'this username not found', message: `${userName} not found` });

                    if (oldpwd !== password)
                        return res.send(401, {"user": userName, status: 'password not corect', message: `Password not corect for ${userName}` });

                    if (newpwd.length < 8)
                        return res.send(400, { "user": userName, status: 'password must be 8 char +' });
                    
                    if (oldpwd === newpwd || newpwd === password)
                        return res.send(400, {"user": userName, status: 'new password must be different', message: 'New password must be different from current password' });

                    password = newpwd;
                    return res.send(200, { "user": userName, status: 'password changed', message: 'Password updated successfully'})

                } catch(error: any) {
                    server.log(`Password change error: ${error}`, "error");
                    return res.send(500, { "user": req.body?.username || 'unknown', status: 'error', message: 'Internal server error'});
                }
            }
        })

        server.add({
            method: "POST",
            middelWares: [Auth],
            path: "/api/logout/:SessionId",
            handler: async (req: ServerReq, res: ServerRes) => {
                let SessionID = req.params.SessionId

                if (typeof SessionID === undefined)
                    return res.send(404, {status: "not found"})

                for (let i = 0; i < sessions.length; i++){
                    if (SessionID === sessions[i]?.id){
                        (sessions[i] as any).isValid = false;
                        return res.send(200, {status: `session ${SessionID} logouted`})
                    }
                }
                return res.send(404, {status: "not found"})
            }
        })

        server.add({
            method: "POST",
            middelWares: [Auth],
            path: "/passwd/change/auth",
            handler: async (req: ServerReq, res: ServerRes) => {
                try {
                    const { oldpwd, newpwd } = req.body
                    if (!oldpwd || !newpwd)
                        return res.send(401, {status: "all field are required !"})

                    if (oldpwd !== password)
                        return res.send(401, {status: "incorect password"})

                    if (oldpwd === newpwd)
                        return res.send(400, {status: "old pwd must be defrent from new one"})

                    password = newpwd;
                    return res.send(200, {status: "password changed with secc"})

                } catch {
                    res.send(500, {status: "internal server error"})
                }
                return res.send(401, {status: "?"})
            }
        })

        server.add({
            method: "POST",
            middelWares: [Auth],
            path: "/api/user/change",
            handler: async (req: ServerReq, res: ServerRes) => {
                try {
                    const { userName } = req.body

                    if (!userName)
                        return res.send(401, {status: "all field are required !"})


                    if (userName.length <= 3 || userName.length >= 20)
                        return res.send(400, {status: "username must be between 4-19"})

                    username = userName;
                    return res.send(200, {status: "username changed with secc"})

                } catch {
                    res.send(500, {status: "internal server error"})
                }
                return res.send(401, {status: "?"})
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
