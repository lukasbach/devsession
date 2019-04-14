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
  private socketServer: Server;

  constructor(socketServer: Server, authService: AuthenticationService) {
    this.authService = authService;
    this.socketServer = socketServer;

    this.router = express.Router();
    this.defineRoutes();
  }

  public abstract onNewSocket(socket: Socket): void;
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
      const userId = payload.userId;

      try {
        this.logDataFlow("toServer", `Received %s from ${payload.userId || socket.client.id}`, message, payload, 2);

        if (requireAuth && (!payload.userId || !payload.authKey)) {
          throw Error(`The server received an unauthorized message from an user.`);
        }

        if (requireAuth && !this.authService.validateAuth(payload.userId, payload.authKey)) {
          throw Error(`The server received an message with invalid authorization from an user.`);
        }

        type MayBeAuth = M extends SocketMessages.IAuthoredMessageObject<any, any> ? SocketMessages.IAuthoringUserInformation : {};
        let auth: MayBeAuth;

        if (requireAuth) {
          auth = {
            userId: payload.userId,
            authKey: payload.authKey
          } as MayBeAuth;
        } else {
          auth = {} as MayBeAuth;
        }

        payload.userId = undefined;
        payload.authKey = undefined;

        handler(payload, auth);
      } catch (e) {
        console.log(chalk.red("An error occured in socket message handler"));
        console.log(e);
        this.createServerError(e.message, [
          `The reached message endpoint was ${message}, the user ID was ${userId}.`
        ], { error: e, payload, message, errorstack: e.stack });
      }
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
    message: SocketMessages.InferText<M>,
    payload: SocketMessages.InferPayload<M>
  ) {
    this.logDataFlow("toClient", `Broadcasting %s to everyone`, message, payload, 3);
    this.socketServer.emit(message, payload);
  }

  protected sendToUser<M extends SocketMessages.IMessageObject<any, any>>(
    userId: string,
    message: SocketMessages.InferText<M>,
    payload: SocketMessages.InferPayload<M>
  ) {
    this.logDataFlow("toClient", `Broadcasting %s to user ${userId}`, message, payload, 3);
    // TODO error
    const socketId = this.authService.getSocketIdFromUserId(userId);
    if (socketId) {
      this.socketServer.to(socketId).emit(message, payload);
    } else {
      this.createServerError(
        "Attempted to send message to user with unknown ID",
        [`Unknown user ID was ${userId}`],
        {userId, socketId, message, payload}
        );
    }
  }

  protected respondUserError(
    socket: Socket,
    title: string,
    message?: string[],
    data?: object
  ) {
    this.respond<SocketMessages.Errors.ErrorOccured>(socket, "@@ERRORHANDLING/NEW_ERROR", {
      error: {
        errortype: "user",
        title,
        message,
        data
      }
    });
  }

  protected createServerError(
    title: string,
    message?: string[],
    data?: object
  ) {
    this.authService.getAdmins().forEach((user) => {
      this.sendToUser<SocketMessages.Errors.ErrorOccured>(user.id, "@@ERRORHANDLING/NEW_ERROR", {
        error: {
          errortype: "server",
          title,
          message,
          data
        }
      });
    });
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
