import * as http from "http"
import Server from "./Server.js"


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
    ReqUrl: URL | null,
    Query: URLSearchParams,
    queries: object,
    body?: any,
    RawBody: Buffer
    ip: string,
    server: Server,
    params: Record<string, string>,
}

export type ServFiles = {
    FileName: string,
    prefix: string
}

export type DirFiles = {
    files: ServFiles[]
}

export type ServerRes = http.ServerResponse & {
    body?: any,
    ip: string,
    send: (status: number, data?: any, headers?: object)=>void,
    sendFile: (status: number, ContentType: string, data?: any, headers?: object)=>void,
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
    paramNames: string[],
    handler: Function,
    regex: RegExp,
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
    id: string,
    ip: string,
    userAgent: string,
    creation: number,
    isValid: boolean,
    request: number
}