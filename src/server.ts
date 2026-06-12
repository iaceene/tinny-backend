import { randomBytes, setEngine } from "crypto"
import { Socket } from "dgram"
import * as http from "http"
import * as net from "net"

export type HandlerFun = (req: ServerReq, res: ServerRes)=>void 

export type ServerOptions = {
    port?: number,
    hostname?: string,
    reqPerMinute?: number
}

export type ServerReq = http.IncomingMessage & {
    body?: any,
    server: Server
}

export type ServerRes = http.ServerResponse & {
    body?: any
    send: (status: number, data: any)=>void,
    isClosed: boolean,
    server: Server
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

function defaultHandler(req: ServerReq, res: ServerRes){
    res.send(404, {status: 404, message: `${req.method} https://${req.server.getHost()}${req.url} not found`})
}

export default class Server {
    private PORT: number
    private hostname: string
    private methodHandler: Handlers[]
    private decorators: Decorator[]
    private server
    private sessions: Session[]

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

    add(method: Methods, path: string, handler: Function, middelWares?: HandlerFun[], next?: (req: ServerReq, res: ServerRes)=>void ){
        this.methodHandler.push({
            method,
            handler,
            path : path.replace(/(?<=.)\/+$/, ""),
            middelWares,
            next
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

    constructor(args: ServerOptions){
        this.sessions = []
        this.decorators = []
        this.methodHandler = []
        this.hostname = args.hostname ?? "localhost"
        this.PORT = args.port ?? 3000

        this.server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse)=>{
            let body: string = "";
            (res as ServerRes).isClosed = false

            if (typeof req.headers["content-type"] !== "undefined" && req.headers["content-type"] != 'application/json'){
                res.writeHead(400, {'content-type': 'application/json'})
                res.end(JSON.stringify({
                    "Error" : "cannot accepte incoming messages that not a json type"
                }))
                return;
            }

            if (typeof req.headers["tiny-session"] === "undefined"){
                let session = this.getSession(req.socket.remoteAddress ?? "me")
                if (typeof session === "undefined")
                    session = this.generateSession(req.socket.remoteAddress ?? "me")
                session.reqCount++;
                if (session.reqCount >= (args.reqPerMinute ?? 10) && Date.now() - session.lastReq < 60000)
                {
                    res.writeHead(429, {'content-type': 'application/json'})
                    res.end(JSON.stringify({
                        "Error" : `Too Many Requests, banned for ${(new Date(session.banInterval)).getMinutes()} minute, your last req at ${(new Date(session.lastReq)).toTimeString()}`,
                        "Next-Retry" : `${(new Date(session.lastReq + session.banInterval)).toTimeString()}`
                    }))
                    return
                }
                if (session.reqCount > (args.reqPerMinute ?? 10) || Date.now() - session.lastReq >= session.banInterval){
                    session.reqCount = 0
                    session.banInterval *= 2
                }
                session.lastReq = Date.now()
            }else{
                let session = this.getSession(req.socket.remoteAddress ?? "me")
                if (typeof session === "undefined")
                    session = this.generateSession(req.socket.remoteAddress ?? "me")
                session.reqCount++;
                if (session.reqCount >= (args.reqPerMinute ?? 10) && Date.now() - session.lastReq < 60000)
                {
                    res.writeHead(429, {'content-type': 'application/json'})
                    res.end(JSON.stringify({
                        "Error" : `Too Many Requests, banned for ${(new Date(session.banInterval)).getMinutes()} minute, your last req at ${(new Date(session.lastReq)).toTimeString()}`,
                        "Next-Retry" : `${(new Date(session.lastReq + session.banInterval)).toTimeString()}`
                    }))
                    return
                }
                if (session.reqCount > (args.reqPerMinute ?? 10) || Date.now() - session.lastReq > session.banInterval){
                    session.reqCount = 0
                    session.banInterval *= 2
                }
                session.lastReq = Date.now()
            }

            req.on("data", (chunk)=>{
                body += chunk.toString();
            })

            req.on("end", ()=>{
                (req as ServerReq).server = this;
                (res as ServerRes).server = this;
                req.url = req.url === "/" ? "/" : req.url?.replace(/(?<=.)\/+$/, "");
                (res as ServerRes).send = (status: number, data?: any)=>{
                    if (!(res as ServerRes).isClosed){
                        res.writeHead(status, { 'Content-Type': 'application/json', 'tiny-session' : this.getSession(req.socket.remoteAddress ?? "me")?.key ?? '' });
                        res.end(data ? JSON.stringify(data) : "");
                        (res as ServerRes).isClosed = true;
                    } else {
                        console.error(`Multipple replays on ${req.url}`)
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
                        this.methodHandler[i]?.handler(req, res);
                        const nextFn = this.methodHandler[i]?.next
                        if (typeof nextFn === "function")
                            nextFn((req as ServerReq), (res as ServerRes))
                        handlersCount++
                    }
                }
                if (!handlersCount)
                    defaultHandler((req as ServerReq), (res as ServerRes))
            })
        })
        this.server.on("connection", (socket: net.Socket)=>{
            console.log(`new connention recieved ip ${socket.remoteAddress} on port ${socket.remotePort}`)
            socket.on("close", (hadError: boolean)=>{
                console.log(`client has drop the connection ${socket.remoteAddress}, ${hadError ? "With an error" : "Without an error"}`)
            })
            socket.on("error", (err: Error)=>{
                console.error(`connection failed with ${socket.remoteAddress}, cause : ${err.message}`)
            })
        })
        this.server.on("close", ()=>{
            console.log(`Server has successfully stopped accepting connections`)
        })
        this.server.on("error", (err: Error)=>{
            console.error(err)
        })
    }

    listen(callback?: () => void){
        this.server.listen(this.PORT, callback ?? (()=>{
            console.log(`Server start listening in http://${this.hostname}:${this.PORT}`)
        }))
    }
}
