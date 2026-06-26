import Server  from "./Server.js"
import type {
    ServerReq
} from "./types.js"

export default function RequestParser(req: ServerReq, server: Server): ServerReq {
    let body: string = "";

    try 
    {
        const NewUrl = "http://" + server.getHost() + ":" + server.getPort() + (req.url ?? "");
        req.ReqUrl = URL.parse(NewUrl);
        (req.ReqUrl as any).pathname = req.ReqUrl?.pathname.replace(/(?<=.)\/+$/, "");
        req.Query = new URLSearchParams((req.ReqUrl as any).searchParams);
        req.queries = Object.fromEntries(req.Query)
    }
    catch 
    {
        server.log(`Cannot parse ${req.url}`, "error");
        (req.ReqUrl as any).pathname = req.url;
        req.queries = {}
    }
    req.ip = req.socket.remoteAddress?.split(':').pop() ?? "DEVICE IP";
    req.server = server

    server.log(`${req.ip} requested METHOD ${req.method}, PATH ${req.ReqUrl?.pathname}`);

    req.on("data", (chunk) => {
        body += chunk.toString();
    })

    return req;
}