import Server from "./core/Server.js";
import type { ServerReq, ServerRes } from "./core/types.js";

const srv = new Server({})

srv.add({
    path: "/",
    method: "POST",
    handler: (req: ServerReq, res: ServerRes)=>{
        res.send(200, {message: "Hello"})
    }
})

srv.listen()