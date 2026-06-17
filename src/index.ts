import Server, { type ServerReq, type ServerRes, type AddOption } from "./server.js";



const srv = new Server({})

srv.add({
    method: "GET",
    handler: (req: ServerReq, res: ServerRes)=>{
        console.log("first function")
    },
    next: (req: ServerReq, res: ServerRes)=>{
        console.log("second function")
        res.send(200, {
            "contacts" : [
                "contact1",
                "contact2",
                "contact3"
            ]
        }, {
            key: "hhh",
            value: "efefefe"
        })
    },
    path: "/contacts",
    middelWares: [(req: ServerReq, res: ServerRes)=>{
        
    }, (req, res)=>{
        console.log("second middel ware")
    }],
})

srv.listen(true)