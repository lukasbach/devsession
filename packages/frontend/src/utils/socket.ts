import {SocketMessages} from "../types/communication";
import io from "socket.io-client";

/*export const emit = <M extends SocketMessages.IMessageObject<any, any>>(
  socket: SocketIOClient.Socket,
  message: SocketMessages.InferText<M>,
  payload: SocketMessages.InferPayload<M>
) => {
  socket.emit(message, payload);
};

export const onSocketMessage = <M extends SocketMessages.IMessageObject<any, any>>(
  socket: SocketIOClient.Socket,
  message: SocketMessages.InferText<M>,
  then: (payload: SocketMessages.InferPayload<M>) => void
) => {
  socket.on(message, (payload: SocketMessages.InferPayload<M>) => then(payload));
};*/

export const connectToSocketServer = () => io("http://localhost:4000", { reconnection: true });

export class SocketServer {
  private static server = io("http://localhost:4000", { reconnection: true });

  public static emit<M extends SocketMessages.IMessageObject<any, any>>(
    message: SocketMessages.InferText<M>,
    payload: SocketMessages.InferPayload<M>
  )  {
    this.server.emit(message, payload);
  };

  public static on<M extends SocketMessages.IMessageObject<any, any>>(
    message: SocketMessages.InferText<M>,
    then: (payload: SocketMessages.InferPayload<M>) => void
  )  {
    this.server.on(message, (payload: SocketMessages.InferPayload<M>) => then(payload));
  };

  public static getClientId() {
    return this.server.id;
  }
}
