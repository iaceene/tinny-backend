import * as os from "node:os";
import * as JWT from "jsonwebtoken"
import Server from "../core/Server.js";
import type {
    AdminSessions,
    ServerReq,
    ServerRes
} from "../core/types.js"
import Authen from "./auth.js";

export default function Routes(server: Server){

    const {username, password, sessions, key, SetUsername, SetPassword} = Authen(server)

    const Login = async (req: ServerReq, res: ServerRes) => {
        let token
                
        try {
                if (!req.body.username || req.body.username !== username || !req.body.password || req.body.password !== password)
                    throw new Error("User has entred a none valid cridentials")
                const SESSION_ID = crypto.randomUUID()
                token = JWT.default.sign({ id: SESSION_ID }, key, { expiresIn: "1h" });
                res.addCookie("token", token)
                sessions.push({
                            id: SESSION_ID,
                            isValid: true,
                            creation: Date.now(),
                            userAgent: req.headers["user-agent"] ?? "DEVICE",
                            ip: (req as ServerReq).ip ?? "UNKNOWN",
                            request: 0
                        })
                res.send(200, "./public/admin/index.html", { "set-cookie" : `token=${token}; Path=/; SameSite=Lax; HttpOnly` });
            }
            catch(err: any) {
                    res.server.log(err.message, "error")
                    res.server.log("A user entred a none valid cridentionl", "error")
                    res.send(403, {"Error" : "Access Denied"})
            }
    }

    const Logout = async (req: ServerReq, res: ServerRes) => {
            let payloud: any
            

            const TOKEN = res.getCookie("token")
            if (!TOKEN)
                return server.SendFile(res, "public/login/index.html", 401)

            try {
                payloud = JWT.default.verify(TOKEN.value, key);
                if (typeof payloud.id === "undefined")
                    throw new Error("an Error is happens");
                for (let i = 0; i < sessions.length; i++){
                    if (sessions[i]?.id === payloud.id){
                        if (!sessions[i]?.isValid)
                            throw new Error("None valid token");
                        (sessions[i] as AdminSessions).request += 1;
                        (sessions[i] as AdminSessions).isValid = false;
                        break;
                    }
                }
                return await  server.SendFile(res, "public/login/index.html", 200)
            }
            catch(err: any) {
                server.log(err.message, "error")
                res.send(403, {"Error" : "Access Denied"})
            }
        }

        const Status = async (req: ServerReq, res: ServerRes) => {
                const now: number = Date.now()
                res.send(200, {
                    "Machin uptime": `${Math.floor(os.uptime() / 86400)}d ${Math.floor((os.uptime() % 86400) / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m`,
                    "Server uptime": `${Math.floor((now - server.getUpTime()) / (1000 * 60 * 60 * 24)) % 60}D ${Math.floor((now - server.getUpTime()) / (1000 * 60 * 60)) % 60}H ${Math.floor((now - server.getUpTime()) / (1000 * 60)) % 60}M ${Math.floor((now - server.getUpTime()) / 1000) % 60}S`,
                    "Arch" : os.arch(),
                    "Platform" : os.platform(),
                    "Memory" : `${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB`,
                    "Used Memory" : `${((os.totalmem() - os.freemem()) / (1024 ** 3)).toFixed(2)} GB`,
                    "Free Memory" : `${(os.freemem() / (1024 ** 3)).toFixed(2)} GB`,
                    "Cpu" : os.cpus()[0],
                    "Connected clients" : "0",
                    "Total requests" : server.getReqCount(),
                    "Currnet-session": (res as any).currentID,
                    "sessions": sessions,
                    "routes" : server.getLogs(),
                    "logs" : server.getLogs()
                })
            }

        const CheckUsername = async (req: ServerReq, res: ServerRes) => {
                let userName = req.params.username

                if (typeof username === undefined)
                    return res.send(404, {"user": userName, status: "not found"})

                if (userName === username)
                    return res.send(200, {"user": userName, status: "found"})

                return res.send(404, {"user": userName, status: "not found"})
            }
        
        const ChangePasswd = async (req: ServerReq, res: ServerRes) => {
                try {

                    const { userName, oldpwd, newpwd } = req.body;
                    console.log(req.body)
                    if (!userName || !oldpwd || !newpwd)
                        return res.send(400, { "user": userName || 'unknown', status: 'missing fields', message: 'Username, old password, and new password are required' });

                    if (userName !== username)
                        return res.send(404, {"user": userName, status: 'this username not found', message: `${userName} not found` });

                    if (oldpwd !== password)
                        return res.send(401, {"user": userName, status: 'password not corect', message: `Password not corect for ${userName}` });

                    if (newpwd.length < 8)
                        return res.send(400, { "user": userName, status: 'password must be 8 char +' });
                    
                    if (oldpwd === newpwd || newpwd === password)
                        return res.send(400, {"user": userName, status: 'new password must be different', message: 'New password must be different from current password' });
                    SetPassword(newpwd)
                    return res.send(200, { "user": userName, status: 'password changed', message: 'Password updated successfully'})

                } catch(error: any) {
                    server.log(`Password change error: ${error}`, "error");
                    return res.send(500, { "user": req.body?.username || 'unknown', status: 'error', message: 'Internal server error'});
                }
            }

        const LogoutSession = async (req: ServerReq, res: ServerRes) => {
                let SessionID = req.params.SessionId

                if (typeof SessionID === undefined)
                    return res.send(404, {status: "not found"})

                for (let i = 0; i < sessions.length; i++){
                    if (SessionID === sessions[i]?.id){
                        (sessions[i] as any).isValid = false;
                        return res.send(200, {status: `session ${SessionID} logouted`})
                    }
                }
                return res.send(404, {status: "not found"})
            }

        const ChangePasswdAuth = async (req: ServerReq, res: ServerRes) => {
                try {
                    const { oldpwd, newpwd } = req.body
                    if (!oldpwd || !newpwd)
                        return res.send(401, {status: "all field are required !"})

                    if (oldpwd !== password)
                        return res.send(401, {status: "incorect password"})

                    if (oldpwd === newpwd)
                        return res.send(400, {status: "old pwd must be defrent from new one"})

                    SetPassword(newpwd)
                    return res.send(200, {status: "password changed with secc"})

                } catch {
                    res.send(500, {status: "internal server error"})
                }
                return res.send(401, {status: "?"})
            }
        
        const ChangeUser = async (req: ServerReq, res: ServerRes) => {
                try {
                    const { userName } = req.body

                    if (!userName)
                        return res.send(401, {status: "all field are required !"})


                    if (userName.length <= 3 || userName.length >= 20)
                        return res.send(400, {status: "username must be between 4-19"})

                    SetUsername(userName)
                    return res.send(200, {status: "username changed with secc"})

                } catch {
                    res.send(500, {status: "internal server error"})
                }
                return res.send(401, {status: "?"})
            }

        return {ChangeUser, LogoutSession, ChangePasswd, ChangePasswdAuth, CheckUsername, Status, Logout, Login}
}

