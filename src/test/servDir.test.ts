import Server from '../core/Server.js';
import path from 'node:path';

function main(){
    const server = new Server({})

    server.servDir(path.join(process.cwd(), "./static_files"), "/", "index.html");

    server.listen()
}

main();