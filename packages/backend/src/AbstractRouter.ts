import chalk from "chalk";
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
    socket.on(message, (payload) => {
      this.logDataFlow("toServer", `Received %s from ${socket.client.id}`, message, payload, 2);
      handler(payload, { message, payload } as M);
      console.log("-".repeat(100));
    });
  }

  protected forward<M extends SocketMessages.IMessageObject<any, any>>(
    socket: Socket,
    message: SocketMessages.InferText<M>,
    payload: SocketMessages.InferPayload<M>
  ) {
    this.logDataFlow("toClient", `Forwarding %s to everyone except sender`, message, payload, 3);
    socket.broadcast.emit(message, payload);
  }

  protected respond<M extends SocketMessages.IMessageObject<any, any>>(
    socket: Socket,
    message: SocketMessages.InferText<M>,
    payload: SocketMessages.InferPayload<M>
  ) {
    this.logDataFlow("toClient", `Sending %s only to sender`, message, payload, 3);
    socket.emit(message, payload);
  }

  protected broadcast<M extends SocketMessages.IMessageObject<any, any>>(
    socketServer: Server,
    message: SocketMessages.InferText<M>,
    payload: SocketMessages.InferPayload<M>
  ) {
    this.logDataFlow("toClient", `Broadcasting %s to everyone`, message, payload, 3);
    socketServer.emit(message, payload);
  }

  private logDataFlow(direction: "toServer" | "toClient", text: string, message: string, payload?: any, indentation?: number) {
    console.log(
      " ".repeat((indentation || 2) * 2)
      + chalk.cyan(direction === "toServer" ? ">>" : "<<")
      + " "
      + text.replace(/\%s/g, chalk.cyan(message))
    );

    if (payload) {
      console.log(
        " ".repeat((indentation || 2) * 2 + 2)
        + "with data: "
        + chalk.gray(JSON.stringify(payload))
      );
    }
  }
}
