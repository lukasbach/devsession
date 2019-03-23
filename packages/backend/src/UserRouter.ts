import {Server, Socket} from "socket.io";
import {SocketMessages} from "../../frontend/src/types/communication";
import {IUser} from "../../frontend/src/types/users";
import {AbstractRouter} from "./AbstractRouter";

export default class UserRouter extends AbstractRouter {
  public readonly routerPrefix = "users";

  private users: IUser[] = [];

  public onNewSocket(socket: Socket, server: Server): void {
    this.onSocketMessage<SocketMessages.Users.NewUser>(socket, "@@USERS/NEW_USER", (payload, msg) => {
      this.users.forEach((userdata) => this.respond<SocketMessages.Users.NewUser>(socket, msg.message, { userdata }));

      this.users.push({
        ...payload.userdata,
        id: socket.client.id
      });

      this.forward<SocketMessages.Users.NewUser>(socket, msg.message, msg.payload);
    });

    this.onSocketMessage<SocketMessages.Users.UserChangedData>(socket, "@@USERS/USER_CHANGED_DATA", (payload, msg) => {
      this.users = this.users.map((user) => user.id === socket.client.id ? { ...user, ...payload.userdata, id: socket.client.id } : user);

      this.broadcast<SocketMessages.Users.UserChangedData>(server, msg.message, msg.payload);
    });

    this.onSocketMessage<SocketMessages.Users.UserLeft>(socket, "@@USERS/USER_LEFT", (payload, msg) => {
      this.users = this.users.filter((user) => user.id === socket.client.id);

      this.broadcast<SocketMessages.Users.UserLeft>(server, msg.message, msg.payload);
    });

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected, reason: ${reason}`);
      this.users = this.users.filter((user) => user.id === socket.client.id);
      this.forward<SocketMessages.Users.UserLeft>(socket, "@@USERS/USER_LEFT", { user: socket.client.id });
    });
  }

  public defineRoutes(): void {
    console.log("a");
  }
}
