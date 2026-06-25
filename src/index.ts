import Server from "./server.js";

const srv = new Server({port: 3000})

srv.add({
    path: "/login",
    method: "GET",
    handler: (req, res) => {
        res.send(200, {data: "server is runing"})
    }
})


srv.listen(true)