import io from "socket.io-client";
import {SocketMessages} from "../types/communication";

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
    this.server.on(message, (payload: SocketMessages.InferPayload<M>) => {
      console.log(`Received ${message}`);
      then(payload);
    });
  }

  public static setAuth(userId: string, authKey: string) {
    this.userId = userId;
    this.authKey = authKey;
  }
  private static server = io("http://localhost:4000", { reconnection: true });
  private static userId: string;
  private static authKey: string;
}
