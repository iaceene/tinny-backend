import * as http from "http"
import * as net from "net"

export type ServerOptions = {
    port?: number,
    hostname?: string
}

export type ServerReq = http.IncomingMessage & {
    body?: any
}

export type ServerRes = http.ServerResponse & {
    body?: any
    send: Function,
    isClosed: boolean
}

export type Methods = "POST" | "GET" | "PUT" | "DELETE"

export type Handlers = {
    method: Methods,
    path: string,
    handler: Function
    middelWares?: Function[] | undefined
    next?: Function | undefined
}

function defaultHandler(req: ServerReq, res: ServerRes){
    res.send(200, {data: `Server Working Fine, add a function handler for this route ${req.url}`})
}

export default class Server {
    private PORT: number
    private hostname: string
    private methodHandler: Handlers[]

    add(method: Methods, path: string, handler: Function, middelWares?: Function[], next?: Function){
        this.methodHandler.push({
            method,
            handler,
            path : path.replace(/(?<=.)\/+$/, ""),
            middelWares,
            next
        })
    }

    constructor(args: ServerOptions){
        this.methodHandler = []
        this.hostname = args.hostname ?? "localhost"
        this.PORT = args.port ?? 3000

        const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse)=>{
            let body: string = "";
            (res as ServerRes).isClosed = false

            req.on("data", (chunk)=>{
                body += chunk.toString();
            })

            req.on("end", ()=>{
                req.url = req.url?.replace(/(?<=.)\/+$/, "");
                (res as ServerRes).send = (status: number, data?: any)=>{
                    if (!(res as ServerRes).isClosed){
                        res.writeHead(status, { 'Content-Type': 'application/json' });
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
                            this.methodHandler[i]?.middelWares?.forEach((middelware)=>middelware(req, res))
                        this.methodHandler[i]?.handler(req, res);
                        const nextFn = this.methodHandler[i]?.next
                        if (typeof nextFn === "function")
                            nextFn(req, res)
                        handlersCount++
                    }
                }
                if (!handlersCount)
                    defaultHandler(req, (res as ServerRes))
            })
        })
        server.on("connection", (socket: net.Socket)=>{
            console.log(`new connention recieved ip ${socket.remoteAddress} on port ${socket.remotePort}`)
            socket.on("close", (hadError: boolean)=>{
                console.log(`client has drop the connection ${socket.remoteAddress}, ${hadError ? "With an error" : "Without an error"}`)
            })
            socket.on("error", (err: Error)=>{
                console.error(`connection failed with ${socket.remoteAddress}, cause : ${err.message}`)
            })
        })
        server.on("close", ()=>{
            console.log(`Server has successfully stopped accepting connections`)
        })
        server.on("error", (err: Error)=>{
            console.error(err)
        })
        server.listen(this.PORT, ()=>{
            console.log(`Server start listening in http://${this.hostname}:${this.PORT}`)
        })
    }
}
