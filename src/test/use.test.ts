import Server from '../core/Server.js';

function main(){
    const server = new Server({})

    server.use((req, res)=>{
        if (req.url == "/api/test")
        res.send(200, {'message': 'working !'})
    })
    server.add({
        path: "/",
        method: "GET",
        handler: (req, res)=>{
            res.send(200, {'message': 'root rout working !'})
        }
    })
    server.listen()
}

main();