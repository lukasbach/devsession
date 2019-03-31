import cors from "cors";
import express from "express";
import * as http from "http";
import io from "socket.io";
import socketIoWildCardMiddleware from "socketio-wildcard";
import {AbstractRouter} from "./AbstractRouter";
import {AuthenticationService} from "./AuthenticationService";
import EditorRouter from "./EditorRouter";
import FileSystemRouter from "./FileSystemRouter";
import PermissionRouter from "./PermissionRouter";
import TerminalRouter from "./TerminalRouter";
import {TerminalService} from "./TerminalService";
import UserRouter from "./UserRouter";

const app = express();
const server = http.createServer(app);
app.use(cors());

const socketServer = io(server, {
  origins: "*:*"
});

socketServer.use(socketIoWildCardMiddleware());

const authService = new AuthenticationService();
const terminalService = new TerminalService();

const userRouter = new UserRouter(authService);
const permissionRouter = new PermissionRouter(authService);
const editorRouter = new EditorRouter(authService, permissionRouter);
const fsRouter = new FileSystemRouter(authService, permissionRouter);
const terminalRouter = new TerminalRouter(authService, terminalService, permissionRouter);

const routers: AbstractRouter[] = [
  userRouter,
  editorRouter,
  permissionRouter,
  fsRouter,
  terminalRouter
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
