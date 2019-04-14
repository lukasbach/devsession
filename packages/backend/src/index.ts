import cors from "cors";
import express from "express";
import * as http from "http";
import io, {Server} from "socket.io";
import socketIoWildCardMiddleware from "socketio-wildcard";
import {AbstractRouter} from "./AbstractRouter";
import {AuthenticationService} from "./AuthenticationService";
import EditorRouter from "./EditorRouter";
import {ExternalNavigationRouter} from "./ExternalNavigationRouter";
import FileSystemRouter from "./FileSystemRouter";
import PermissionRouter from "./PermissionRouter";
import PortForwardingRouter from "./PortForwardingRouter";
import {PortForwardingService} from "./PortForwardingService";
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
const portForwardingService = new PortForwardingService();

const userRouter = new UserRouter(socketServer, authService);
const permissionRouter = new PermissionRouter(socketServer, authService);
const editorRouter = new EditorRouter(socketServer, authService, permissionRouter);
const fsRouter = new FileSystemRouter(socketServer, authService, permissionRouter);
const terminalRouter = new TerminalRouter(socketServer, authService, terminalService, permissionRouter);
const portForwardingRouter = new PortForwardingRouter(socketServer, authService, portForwardingService, permissionRouter);
const externalNavigationRouter = new ExternalNavigationRouter(socketServer, authService, permissionRouter);

const routers: AbstractRouter[] = [
  userRouter,
  editorRouter,
  permissionRouter,
  fsRouter,
  terminalRouter,
  portForwardingRouter,
  externalNavigationRouter
];

routers.forEach((router) => {
  router.defineRoutes();
  router.applyToExpress(app);
});

socketServer.on("connection", (socket) => {
  console.log("New connection");
  routers.forEach((router) => router.onNewSocket(socket));
});

server.listen(4000, () => console.log(`Listening on 4000`));
