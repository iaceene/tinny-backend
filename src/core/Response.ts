import Server from "./Server.js"
import fs from "fs"
import type {
    ServerRes,
    ServerReq,
    Cookie
} from "./types.js"
import path from "path"


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
    res.sendFile = async (FILE: string, status: number, headers?: object)=>
        {
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
                    await fs.promises.access(FILE, fs.constants.F_OK);
                    res.server.log(`Sending ${FILE} to ${res.ip }`, (status == 404 || status == 401) ? "error" : "message")
                    if (!res.isClosed)
                        {
                            try 
                            {
                                const fileData = await fs.promises.readFile(FILE);
                                if (res.isClosed)
                                    return;
                                res.writeHead(status, { 'Content-Type': contentType, ...headers });
                                res.end(fileData);
                                res.isClosed = true;
                            }
                            catch (err)
                            {
                                server.log(`cannot read the content of ${FILE}`, "error");
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
                } catch (err) {
                    res.server.log(`cannot find ${FILE} to send to ${res.ip }`, "error")
                    return res.send(404, { status: "Page not found" })
                }
        }

    return res;
}