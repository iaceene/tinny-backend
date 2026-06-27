import Server from "./core/Server.js";
import type { ServerOptions } from "./core/types.js";

export { Server };
export default Server;

export function createServer(options?: ServerOptions) {
    return new Server(options ?? {});
}

export { VERSION } from "./utils/version.js";

export type {
    ServerOptions,
    ServerReq,
    ServerRes,
    AddOption,
    HandlerFun,
    Methods,
    Headers,
    Cookie,
    Logs,
    Session,
    AdminSessions,
    Decorator,
    DirFiles,
    ServFiles
} from "./core/types.js";