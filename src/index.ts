import Server, { type ServerReq, type ServerRes } from "./server.js";

const srv = new Server({})

srv.add("GET", "/", (req: ServerReq, res: ServerRes)=>{
    res.send(200, {
        status: "goood",
        working: "good"
    })
})

srv.listen()