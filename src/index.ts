import Server from "./server.js";

const srv = new Server({port: 3000})

srv.add({
    path: "/messages/:userId",
    method: "GET",
    handler: (req, res) => {
        res.send(200, {data: `message id = ${req.params.userId}`})
    }
})


srv.listen(true)