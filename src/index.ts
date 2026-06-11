import Server, { type ServerReq, type ServerRes } from "./server.js";

const srv = new Server({})

srv.add("GET", "/api", (req: ServerReq, res: ServerRes) =>{
    res.send(200, {
        res: "this rout working fine !"
    })
})

srv.add("GET", "/", (req: ServerReq, res: ServerRes) =>{
    res.send(200, {
        res: "hello root"
    })
}, [(req: any, res: any)=>{
    console.log("hello i'am this middel ware")
    res.send(200, {
        res: "this send from the middelware"
    })
}])
