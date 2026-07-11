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
} from "./types.js";

import { colors } from "../utils/constants.js";

import { randomBytes } from "crypto"
import fs from "fs"
import path, { join } from "path"
import * as http from "http"
import * as net from "net"
import { fileURLToPath } from 'url';
import { readdir } from 'node:fs/promises';
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

    getMethodHandlers(){
        return this.methodHandler
    }

    getDecorators(){
        return this.decorators
    }

    getUpTime(){
        return this.uptime
    }

    getReqCount(){
        return this.reqCount
    }

    getLogs(){
        return this.logs
    }

   


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
            res.server.log(`cannot find ${FILE} to send to ${res.ip }`, "error")
            return res.send(404, {status: "Page not found"})
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
                return res.send(404, {status: "Page not found"});
            })


        this.server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse)=>{
            let body: string = "";
            const rawChunks: Buffer[] = [];

            this.reqCount++;
            
            const Req: ServerReq = RequestParser((req as ServerReq), this);
            const Res: ServerRes = ResponseParser((res as ServerRes), Req, this);
            
            
            req.on("data", (chunk) => {
                body += chunk.toString();
                rawChunks.push(chunk);
            })
            
            req.on("end", async ()=>{
                Req.RawBody = Buffer.concat(rawChunks)
                if (req.headers["content-type"] === "application/json"){
                    Req.body = body ? JSON.parse(body) : null
                }
                
                Req.body = body;
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

    listen(enableMon?: boolean, callback?: () => void){
        this.server.listen(this.PORT, callback ?? (()=>{
            this.log(`start listening in http://${this.hostname}:${this.PORT}`)
        }))
    }
}
