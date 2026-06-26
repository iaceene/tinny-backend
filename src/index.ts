export { default as Server } from './core/Server.js';
export { default as TinnyServer } from './core/Server.js';

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
} from './core/types.js';

export const VERSION = '1.0.0';
export const NAME = 'tinny-backend';


import Server from './core/Server.js';
export default Server;

export function createServer(options?: import('./core/types.js').ServerOptions): Server {
    return new Server(options || {});
}

export const packageInfo = {
    name: NAME,
    version: VERSION,
    description: 'A lightweight Node.js HTTP server framework',
    homepage: 'https://github.com/iaceene/tinny-backend',
    bugs: 'https://github.com/iaceene/tinny-backend/issues'
};