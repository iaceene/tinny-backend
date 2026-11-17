import Server from '../core/Server.js';

function main(){
    const server = new Server({})

    server.add({
        path: "/",
        method: "GET",
        handler: (req, res)=>{
            return res.sendFile(__dirname + "/public/index.html", 200)
        }
    })
    
    server.listen()
}

main();