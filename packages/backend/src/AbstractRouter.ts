import express = require("express");
import {Express} from "express";
import {Server, Socket} from "socket.io";
import {SocketMessages} from "../../frontend/src/types/communication";

export abstract class AbstractRouter {
  public abstract readonly routerPrefix: string;
  protected router: express.Router;

  constructor() {
    this.router = express.Router();
    this.defineRoutes();
  }

  public abstract onNewSocket(socket: Socket, socketServer: Server): void;
  public abstract defineRoutes(): void;

  public applyToExpress(app: Express) {
    app.use("/" + this.routerPrefix, this.router);
  }

  protected onSocketMessage<M extends SocketMessages.IMessageObject<any, any>>(
    socket: Socket,
    message: SocketMessages.InferText<M>,
    handler: (payload: SocketMessages.InferPayload<M>, message: M) => void
  ) {
    socket.on(message, (payload) => handler(payload, { message, payload } as M));
  }

  protected forward<M extends SocketMessages.IMessageObject<any, any>>(
    socket: Socket,
    message: SocketMessages.InferText<M>,
    payload: SocketMessages.InferPayload<M>
  ) {
    console.log(`Forwarding ${message} to everyone except sender.`);
    socket.broadcast.emit(message, payload);
  }

  protected respond<M extends SocketMessages.IMessageObject<any, any>>(
    socket: Socket,
    message: SocketMessages.InferText<M>,
    payload: SocketMessages.InferPayload<M>
  ) {
    console.log(`Sending ${message} only to sender.`);
    socket.emit(message, payload);
  }

  protected broadcast<M extends SocketMessages.IMessageObject<any, any>>(
    socketServer: Server,
    message: SocketMessages.InferText<M>,
    payload: SocketMessages.InferPayload<M>
  ) {
    console.log(`Broadcasting ${message} to everyone.`);
    socketServer.emit(message, payload);
  }
}
