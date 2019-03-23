import {Server, Socket} from "socket.io";
import {SocketMessages} from "../../frontend/src/types/communication";
import {IUserEditorPosition} from "../../frontend/src/types/editor";
import {AbstractRouter} from "./AbstractRouter";

export default class UserPositionRouter extends AbstractRouter {
  public readonly routerPrefix = "userpositions";

  private userPositions: Array<{
    userId: string;
    position: IUserEditorPosition;
  }> = [];

  public onNewSocket(socket: Socket, server: Server): void {
    this.onSocketMessage<SocketMessages.Editor.ChangedPosition>(socket, "@@EDITOR/CHANGED_POSITION", (payload, msg) => {
      this.userPositions = this.userPositions.map((p) => {
        if (p.userId === socket.client.id) {
          return { userId: socket.client.id, position: payload.position };
        } else {
          return p;
        }
      });

      this.forward<SocketMessages.Editor.ChangedPosition>(socket, msg.message, msg.payload);
    });
  }

  public defineRoutes(): void {
    console.log("a");
  }
}
