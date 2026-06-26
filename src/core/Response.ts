import Server from "./Server.js"
import fs from "fs"
import type {
    ServerRes,
    ServerReq,
    Cookie
} from "./types.js"


export default function ResponseParser(res: ServerRes, req: ServerReq, server: Server): ServerRes {
    let cookies: Cookie[] = []
    
    res.isClosed = false;
    res.ip = req.ip

    res.getCookie = (name: string): Cookie | null => 
            {
                if (cookies.length !== 0){
                    for (let i = 0; i < cookies.length; i++)
                        if (cookies[i]?.key === name)
                            return cookies[i] ?? null
                }
                return null
            }

    res.setCookie = (name: string, value: string) => 
        {
            for (let i = 0; i < cookies.length; i++)
                if (name === cookies[i]?.key)
                    (cookies[i] as any).value = value
        }

    res.addCookie = (name: string, value: string)=>
        {
            if (name === "" || value === "")
                return
            if (res.getCookie(name) != null)
                return res.setCookie(name, value);
            cookies.push({ key: name, value })
        }

    res.getAllCookies =  (): string[] => 
        {
            const ArrayBuffer: string[] = []
            for (let i = 0; i < cookies.length; i++)
                ArrayBuffer.push(`${cookies[i]?.key}=${cookies[i]?.value};`)
            return ArrayBuffer
        }

    const setCookies = (cookies: string | undefined)=>
        {
            if (!cookies || cookies === "")
                return
            const pairs = cookies.split("; ")
            if (!pairs)
                return
            for (let i = 0; i < pairs.length; i++)
                res.addCookie(pairs[i]?.split("=")[0] ?? "", pairs[i]?.split("=")[1] ?? "")
        }

    setCookies(req.headers["cookie"]);
    res.server = server;

    res.send = (status: number, data?: any, headers?: object)=>
        {
            if (!res.isClosed){
                res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
                res.end(data ? JSON.stringify(data) : "");
                res.isClosed = true;
            } else {
                server.log(`Multipple replays on ${req.url}`, "error")
            }
        }
    res.sendFile = async (status: number, ContentType: string, data?: any, headers?: object)=>
        {
            if (!res.isClosed)
                {
                    try 
                    {
                        const fileData = await fs.promises.readFile(data.PATH);
                        if (res.isClosed)
                            return;
                        res.writeHead(status, { 'Content-Type': ContentType, ...headers });
                        res.end(fileData);
                        res.isClosed = true;
                    }
                    catch
                    {
                        if (res.isClosed)
                            return;
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('500 - Internal Error or File Not Found');
                        res.isClosed = true;
                        return;
                    }
                }
                else
                    server.log(`Multipple replays on ${req.url}`, "error");
        }

    return res;
}