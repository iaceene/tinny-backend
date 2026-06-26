import * as os from "node:os";
import * as JWT from "jsonwebtoken"
import * as DOTENV from "dotenv"
import Server from "../core/Server.js";
import type {
    AdminSessions,
    ServerReq,
    ServerRes
} from "../core/types.js"

export default function Authen(server: Server){
    DOTENV.config()
    
    let username: string = process.env.ADMIN_USERNAME || ""
    let password: string = process.env.ADMIN_PASSWORD || ""
    const key: string = process.env.ADMIN_KEY || ""
    const sessions: AdminSessions[] = []
    
        
    const isAuthed = (res: ServerRes): boolean =>{
                const TOKEN = res.getCookie("token")
                if (!TOKEN)
                    return false
                try {
                    const decoded: any = JWT.default.verify(TOKEN.value, key);
                    
                    if (typeof decoded.id === undefined)
                        throw new Error("None valid token");
                    for (let i = 0; i < sessions.length; i++){
                        if (sessions[i]?.id === decoded.id){
                            if (!sessions[i]?.isValid)
                                throw new Error("None valid token");
                            (sessions[i] as AdminSessions).request += 1;
                            (res as any).currentID = decoded.id;
                            return true
                        }
                    }
                    throw new Error("None valid UUID");
                } catch {
                    server.log("a user try to login to admin panel using none valid token", "error")
                    return false
                }
                return true
            }
    
    const Auth = async (req: ServerReq, res: ServerRes)=>{
            if (!isAuthed(res)){
                if (req.ReqUrl?.pathname == "/")
                    return await  server.SendFile(res, "public/login/index.html", 401)
                return await  server.SendFile(res, "public/status/401.html", 401)
            }
        
            if (req.ReqUrl?.pathname == "/")
                return await server.SendFile(res, "public/admin/index.html", 200)
        }
    
    const SetUsername = (userName: string)=>{
        username = userName
    }

    const SetPassword = (passWord: string)=>{
        password = passWord
    }

    return {Auth, username, password, sessions, key, SetUsername, SetPassword}
}