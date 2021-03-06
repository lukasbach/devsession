import {SocketMessages} from "@devsession/common";
import io from "socket.io-client";
import {unregister} from "@devsession/guistarter/src/serviceWorker";

export class SocketServer {

  public static emitUnauthorized<M extends SocketMessages.IMessageObject<any, any>>(
    message: SocketMessages.InferText<M>,
    payload: SocketMessages.InferPayload<M>
  )  {
    (async () => this.server.emit(message, payload))();
  }

  public static emit<M extends SocketMessages.IAuthoredMessageObject<any, any>>(
    message: SocketMessages.InferText<M>,
    payload: SocketMessages.InferPayload<M>
  )  {
    setTimeout(() => {
      (async () => {
        this.server.emit(
          message,
          {
            ...payload,
            userId: this.userId,
            authKey: this.authKey
          } as SocketMessages.InferPayload<M> & SocketMessages.IAuthoringUserInformation
        );
      })();
    }, 1);
  }

  public static on<M extends SocketMessages.IMessageObject<any, any>>(
    message: SocketMessages.InferText<M>,
    then: (payload: SocketMessages.InferPayload<M>) => void
  )  {
    const handler = (payload: SocketMessages.InferPayload<M>) => {
      console.log(`Received ${message}`);
      then(payload);
    };
    this.server.on(message, handler);
    return () => { this.server.off(message, handler); };
  }

  public static once<M extends SocketMessages.IMessageObject<any, any>>(
    message: SocketMessages.InferText<M>,
    then: (payload: SocketMessages.InferPayload<M>) => void
  )  {
    const unregister = this.on<M>(message, payload => {
      unregister();
      then(payload);
    });
  }

  public static onDisconnect(handler: () => void) {
    this.server.on('disconnect', handler);
    return () => { this.server.off('disconnect', handler); };
  }

  public static onReconnect(handler: () => void) {
    this.server.on('reconnect', handler);
    return () => { this.server.off('reconnect', handler); };
  }

  public static setAuth(userId: string, authKey: string) {
    this.userId = userId;
    this.authKey = authKey;
  }
  private static server = io((typeof window !== "undefined" && new URLSearchParams(window.location.search).get("backend")) || `${window.location.protocol}//${window.location.host}`, { reconnection: true });
  // TODO
  private static userId: string;
  private static authKey: string;
}
