import chalk from "chalk";
import express = require("express");
import {Express} from "express";
import {Server, Socket} from "socket.io";
import {SocketMessages} from "../../frontend/src/types/communication";
import {AuthenticationService} from "./AuthenticationService";

export abstract class AbstractRouter {
  public abstract readonly routerPrefix: string;
  protected router: express.Router;
  protected authService: AuthenticationService;

  constructor(authService: AuthenticationService) {
    this.authService = authService;

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
    requireAuth: M extends SocketMessages.IAuthoredMessageObject<any, any> ? true : false,
    handler: (
      payload: SocketMessages.InferPayload<M>,
      auth: M extends SocketMessages.IAuthoredMessageObject<any, any> ? SocketMessages.IAuthoringUserInformation : {}
    ) => void
  ) {
    socket.on(message, (payload) => {
      this.logDataFlow("toServer", `Received %s from ${payload.userId || socket.client.id}`, message, payload, 2);

      if (requireAuth && (!payload.userId || !payload.authKey)) {
        console.log(chalk.bgRedBright.white(`Received unauthorized message.`));
        // TODO send error back
        return;
      }

      if (requireAuth && !this.authService.validateAuth(payload.userId, payload.authKey)) {
        console.log(chalk.bgRedBright.white(`Received message with invalid authorization.`));
        // TODO send error back
        return;
      }

      let auth: M extends SocketMessages.IAuthoredMessageObject<any, any> ? SocketMessages.IAuthoringUserInformation : {};

      if (requireAuth) {
        auth = {
          userId: payload.userId,
          authKey: payload.authKey
        } as M extends SocketMessages.IAuthoredMessageObject<any, any> ? SocketMessages.IAuthoringUserInformation : {};
      } else {
        auth = {} as M extends SocketMessages.IAuthoredMessageObject<any, any> ? SocketMessages.IAuthoringUserInformation : {};
      }

      payload.userId = undefined;
      payload.authKey = undefined;

      handler(payload, auth);
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

  protected sendToUser<M extends SocketMessages.IMessageObject<any, any>>(
    socketServer: Server,
    userId: string,
    message: SocketMessages.InferText<M>,
    payload: SocketMessages.InferPayload<M>
  ) {
    this.logDataFlow("toClient", `Broadcasting %s to user ${userId}`, message, payload, 3);
    // TODO error
    const socketId = this.authService.getSocketIdFromUserId(userId);
    if (socketId) {
      socketServer.to(socketId).emit(message, payload);
    } else {
      console.log("But user was not found.");
    }
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
