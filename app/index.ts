import { uptime } from "node:process";
import Server from "../src/index.js";

const srv = new Server({})

srv.add({
    path: "/",
    handler: async (req, res) => {
        return await srv.SendFile(res, "public/example/default.html", 200)
    },
    method: "GET"
})

srv.add({
    path: "/api/info",
    handler: async (req, res) =>{
        return res.send(200, {uptime: uptime()})
    },
    method: "GET"
})


srv.listen(true)