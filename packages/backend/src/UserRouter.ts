import {Server, Socket} from "socket.io";
import {SocketMessages} from "../../frontend/src/types/communication";
import {IUser} from "../../frontend/src/types/users";
import {AbstractRouter} from "./AbstractRouter";

export default class UserRouter extends AbstractRouter {
  public readonly routerPrefix = "users";

  public onNewSocket(socket: Socket): void {
    this.onSocketMessage<SocketMessages.Users.UserInitialized>(socket, "@@USERS/INITIALIZE_USER", false, (payload) => {
      this.authService.getAllUsers().forEach((userdata) => {
        this.respond<SocketMessages.Users.NewUser>(socket, "@@USERS/NEW_USER", { userdata });
      });

      let user: IUser;
      let authkey: string;

      /*if (this.authService.getUserIdFromSocketId(socket.client.id)) {
        console.log(`Reactivating user from socket id`);
        user = this.authService.reactivateUser(this.authService.getUserIdFromSocketId(socket.client.id));
        authkey = this.authService.getAuthKeyForUser(user.id);
      } else {
        console.log(`Creating fresh user`);
        const authData = this.authService.createUser(payload.adminKey);
        user = this.authService.getUser(authData.userId);
        authkey = authData.authKey;
        this.authService.associateSocketIdToUserId(socket.client.id, user.id);
      }*/
      const authData = this.authService.createUser(payload.adminKey);
      user = this.authService.getUser(authData.userId);
      authkey = authData.authKey;
      this.authService.associateSocketIdToUserId(socket.client.id, user.id);

      this.forward<SocketMessages.Users.NewUser>(socket, "@@USERS/NEW_USER", { userdata: user });
      this.respond<SocketMessages.Users.UserInitializedResponse>(socket, "@@USERS/INITIALIZE_RESPONSE", { user, authkey });
    });

    this.onSocketMessage<SocketMessages.Users.UserChangedData>(socket, "@@USERS/USER_CHANGED_DATA", true, (payload, auth) => {
      this.authService.modifyUser(auth.userId, payload.userdata);

      this.broadcast<SocketMessages.Users.NotifyUserChangedData>("@@USERS/NOTIFY_USER_CHANGED_DATA", {
        user: auth.userId,
        userdata: this.authService.getUser(auth.userId)
      });
    });

    this.onSocketMessage<SocketMessages.Users.UserLeft>(socket, "@@USERS/USER_LEFT", true, (payload, auth) => {
      this.authService.makeUserInactive(auth.userId);
      this.broadcast<SocketMessages.Users.UserLeft>("@@USERS/USER_LEFT", { user: auth.userId });
    });

    this.onSocketMessage<SocketMessages.Users.UserSetIsAdmin>(socket, "@@USERS/SET_IS_ADMIN", true, (payload, auth) => {
      if (!this.authService.getUser(auth.userId).isAdmin) {
        throw Error(`Could not change admin status of user, the authoring user does not have admin status.`);
      }

      this.authService.setUserAdminStatus(payload.user, payload.isAdmin);

      this.broadcast<SocketMessages.Users.NotifyUserChangedData>("@@USERS/NOTIFY_USER_CHANGED_DATA", {
        user: payload.user,
        userdata: { isAdmin: payload.isAdmin }
      });
    });

    socket.on("disconnect", (reason) => {
      const userId = this.authService.getUserIdFromSocketId(socket.client.id);
      console.log(`User ${userId} disconnected, reason: ${reason}`);
      this.authService.makeUserInactive(userId);
      this.forward<SocketMessages.Users.UserLeft>(socket, "@@USERS/USER_LEFT", { user: userId });
    });
  }

  public defineRoutes(): void {
    // No routes
  }
}
