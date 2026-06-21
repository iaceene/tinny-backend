import Server from "./server.js";

const srv = new Server({port: 3000})

console.log(`Serving this dir ${(process.env.PWD ?? ".")}/${process.argv[2] ?? ""} at http://localhost:3000`)

srv.servDir(process.argv[2] ?? ".", "/")

srv.listen(false, ()=>{

})