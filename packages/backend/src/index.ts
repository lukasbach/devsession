import cors from "cors";
import express from "express";
import * as http from "http";
import io from "socket.io";
import socketIoWildCardMiddleware from "socketio-wildcard";
import {AbstractRouter} from "./AbstractRouter";
import EditorRouter from "./EditorRouter";
import UserRouter from "./UserRouter";

const app = express();
const server = http.createServer(app);
app.use(cors());

const socketServer = io(server, {
  origins: "*:*"
});

socketServer.use(socketIoWildCardMiddleware());

const routers: AbstractRouter[] = [
  new UserRouter(),
  new EditorRouter()
];

routers.forEach((router) => {
  router.defineRoutes();
  router.applyToExpress(app);
});

socketServer.on("connection", (socket) => {
  console.log("New connection");
  routers.forEach((router) => router.onNewSocket(socket, socketServer));
});

server.listen(4000, () => console.log(`Listening on 4000`));
