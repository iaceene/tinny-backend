import type { 
    ServerOptions, 
    ServerReq, 
    ServerRes, 
    Handlers, 
    AddOption,
    HandlerFun,
    Decorator,
    Session,
    Logs,
    DirFiles,
    GolobalMidellWare,
} from "./types.js";

import { colors } from "../utils/constants.js";

import { randomBytes } from "crypto"
import path, { join } from "path"
import * as http from "http"
import * as net from "net"
import { readdir } from 'node:fs/promises';
import RequestParser from "./Request.js";
import ResponseParser from "./Response.js";
import { TinnyWs } from "./Websocket.js";
import { dir } from "node:console";


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
    private golobalMidellWare: GolobalMidellWare[]
    private Wss: TinnyWs | null = null;

    getMethodHandlers(){
        return this.methodHandler
    }

    getHttpServer(){
        return this.server;
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

    createWsServer(){
        if (!this.Wss)
            this.Wss = new TinnyWs(this);
        return this
    }

    getWsServer(){
        if (this.Wss)
            return this.Wss.getWss();
        this.Wss = new TinnyWs(this)
        return this.Wss.getWss();
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

    use(fun: HandlerFun){
        this.golobalMidellWare.push({ handler: fun })
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
                    result.files.push({ fileName: entry.name, filePath: join(entry.parentPath, entry.name), prefix :  path.join(prefix, path.relative(DIR, entry.parentPath), entry.name) })
            return result;
        } 
        catch (error) {
            this.log(`Error reading directory: ${DIR} error ${error}`, "error");
        }
        return null;
    }

    async servDir(DIR: string, pref: string, entryPointFile?: string, middelWares?: HandlerFun[]){
        try {
            const dirs = await this.readDir(DIR, pref)
            if (!dirs)
                throw new Error(`Cannot read dirctory content ${DIR}`);
            dirs.files.forEach((file)=>{
                if (entryPointFile && path.join(pref, entryPointFile) === file.prefix){
                    this.add(
                        {
                            handler: (req, res) => {
                                return res.sendFile(file.filePath, 200);
                            },
                            path: pref,
                            method: "GET",
                            middelWares
                        }
                    )
                }
                this.add(
                    {
                        handler: (req, res) => {
                            return res.sendFile(file.filePath, 200);
                        },
                        path: file.prefix,
                        method: "GET",
                        middelWares
                    }
                )
            })
        } catch (err: any) {
            this.log((err as Error).message, "error")
            return;
        }
    }

    log(message: string, type?: "error" | "message"){
        const DateObj = new Date();
        const date = `${DateObj.toDateString() + " " + DateObj.toLocaleTimeString()}`

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
        this.golobalMidellWare = []
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
                    try {
                        Req.body = body ? JSON.parse(body) : null;
                    } catch {
                        Req.body = body;
                    }
                } else {
                    Req.body = body;
                }
                body = "";

                for(let i = 0; i < this.methodHandler.length; i++){
                    const match = Req.ReqUrl?.pathname.match(this.methodHandler[i]?.regex ?? "")
                    if (this.methodHandler[i]?.method == req.method && match){
                        Req.params = {}
                        this.methodHandler[i]?.paramNames.forEach((name, index) => {
                            Req.params[name] = match[index + 1] || "";
                        })
                        if (!res.writableEnded) {
                            if (this.methodHandler[i]?.middelWares && typeof this.methodHandler[i]?.middelWares != "undefined") {
                                for (const middelware of this.methodHandler[i]?.middelWares ?? []) {
                                    await middelware(Req, Res);
                                    if (res.writableEnded)
                                        break;
                                }
                            }
                            if (!res.writableEnded)
                                await this.methodHandler[i]?.handler(Req, Res);
                            const nextFn = this.methodHandler[i]?.next
                            if (typeof nextFn === "function" && !res.writableEnded)
                                await nextFn(Req, Res)
                        }
                        break;
                    }
                }
                for (const fun of this.golobalMidellWare){
                    if (res.writableEnded)
                        break;
                    await fun.handler(req as ServerReq, res as ServerRes)
                }
                if (!res.writableEnded){
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

    listen(callback?: () => void){
        this.server.listen(this.PORT, callback ?? (()=>{
            this.log(`start listening in http://${this.hostname}:${this.PORT}`)
        }))
    }
}
