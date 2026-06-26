import Server from "../core/Server.js";
import type {
    ServerReq,
    ServerRes
} from "../core/types.js"
import Authen from "./auth.js";
import Routes from "./routes.js";

export default function monitor(server: Server){
        const {Auth, sessions, key, SetUsername, SetPassword, GetPasswd, GetUser} = Authen(server)
        const { ChangeUser, LogoutSession, ChangePasswd, ChangePasswdAuth, CheckUsername, Status, Logout, Login } = Routes(server,  {Auth, sessions, key, SetUsername, SetPassword, GetPasswd, GetUser})


        server.add({
            method: "POST",
            handler: Login,
            path: "/api/login" 
        })

        server.add({
            method: "GET",
            middelWares: [Auth],
            handler: async (req, res)=>{
                return await  server.SendFile(res, "public/login/index.html", 200)
            },
            path: "/" 
        })

        server.add({
            method: "GET",
            middelWares: [Auth],
            handler: Logout,
            path: "/api/logout" 
        })

        server.add({
            method: "GET",
            middelWares: [Auth],
            path: "/admin/status",
            handler: Status
        })

        server.add({
            method: "GET",
            middelWares: [Auth],
            path: "/messages",
            handler: async (req: ServerReq, res: ServerRes) => {
                res.send(200, {
                    "logs" : server.getLogs()
                })
            }
        })

        server.add({
            method: "GET",
            path: "/passwd",
            handler: async (req: ServerReq, res: ServerRes) => {
                return await server.SendFile(res, "./public/login/new-password.html", 200)
            }
        })

        server.add({
            method: "GET",
            path: "/api/passwd/:username",
            handler: CheckUsername
        })

        server.add({
            method: "POST",
            path: "/api/passwd/change",
            handler: ChangePasswd
        })

        server.add({
            method: "POST",
            middelWares: [Auth],
            path: "/api/logout/:SessionId",
            handler: LogoutSession
        })

        server.add({
            method: "POST",
            middelWares: [Auth],
            path: "/passwd/change/auth",
            handler: ChangePasswdAuth
        })

        server.add({
            method: "POST",
            middelWares: [Auth],
            path: "/api/user/change",
            handler: ChangeUser
        })

        server.servDir("./public/doc", "docs")
        server.servDir("./public/imgs", "imgs")
        server.servDir("./public/login", "/", [Auth])
        server.servDir("./public/admin", "admin", [Auth])


        server.listen(false)
}