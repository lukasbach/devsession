import {Server, Socket} from "socket.io";
import {SocketMessages} from "../../frontend/src/types/communication";
import {IUser} from "../../frontend/src/types/users";
import {mergeDeep} from "../../frontend/src/utils/deepmerge";
import {AbstractRouter} from "./AbstractRouter";

const adminKey = "key";

export default class UserRouter extends AbstractRouter {
  public readonly routerPrefix = "users";

  private users: IUser[] = [];

  public onNewSocket(socket: Socket, server: Server): void {
    this.onSocketMessage<SocketMessages.Users.UserInitialized>(socket, "@@USERS/INITIALIZE_USER", (payload, msg) => {
      this.users.forEach((userdata) => {
        this.respond<SocketMessages.Users.NewUser>(socket, "@@USERS/NEW_USER", { userdata });
      });

      const user: IUser = {
        id: socket.client.id,
        name: "New user",
        position: {},
        isAdmin: this.users.length === 0 || (payload.adminKey && payload.adminKey === adminKey)
      };

      this.users.push(user);

      this.forward<SocketMessages.Users.NewUser>(socket, "@@USERS/NEW_USER", { userdata: user });
      this.respond<SocketMessages.Users.UserInitializedResponse>(socket, "@@USERS/INITIALIZE_RESPONSE", { user });
    });

    this.onSocketMessage<SocketMessages.Users.UserChangedData>(socket, "@@USERS/USER_CHANGED_DATA", (payload, msg) => {
      let newUserData: IUser;

      this.users = this.users.map((user) => {
        if (user.id === socket.client.id) {
          newUserData = mergeDeep(user, payload.userdata, { id: socket.client.id });
          return newUserData;
        } else {
          return user;
        }
      });

      if (!newUserData) {
        console.error(`User changed data, but was not initialized before.`);
        console.log(JSON.stringify(this.users));
        return;
      }

      this.broadcast<SocketMessages.Users.UserChangedData>(server, msg.message, { user: socket.client.id, userdata: newUserData });
    });

    this.onSocketMessage<SocketMessages.Users.UserLeft>(socket, "@@USERS/USER_LEFT", (payload, msg) => {
      this.users = this.users.filter((user) => user.id !== socket.client.id);

      this.broadcast<SocketMessages.Users.UserLeft>(server, msg.message, { user: socket.client.id });
    });

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected, reason: ${reason}`);
      this.users = this.users.filter((user) => user.id !== socket.client.id);
      this.forward<SocketMessages.Users.UserLeft>(socket, "@@USERS/USER_LEFT", { user: socket.client.id });
    });
  }

  public defineRoutes(): void {
    console.log("a");
  }

  public getAdmins(): IUser[] {
    return this.users.filter((u) => u.isAdmin);
  }

  public getUser(id: string): IUser | undefined {
    return this.users.find((u) => u.id === id);
  }
}
