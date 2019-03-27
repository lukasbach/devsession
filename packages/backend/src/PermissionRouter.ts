import {Server, Socket} from "socket.io";
import {find} from "tslint/lib/utils";
import {SocketMessages} from "../../frontend/src/types/communication";
import {IUserPermission} from "../../frontend/src/types/permissions";
import {IUser} from "../../frontend/src/types/users";
import {AbstractRouter} from "./AbstractRouter";
import UserRouter from "./UserRouter";

export default class PermissionRouter extends AbstractRouter {
  public readonly routerPrefix = "permissions";

  private permissions: { [userId: string]: IUserPermission[] } = {};
  private requestedPermissions: IUserPermission[] = [];
  private userRouter: UserRouter;
  private permissionCounter = 0;

  constructor(userRouter: UserRouter) {
    super();
    this.userRouter = userRouter;
  }

  public onNewSocket(socket: Socket, server: Server): void {
    this.onSocketMessage<SocketMessages.Permissions.RequestPermission>(socket, "@@PERM/REQUEST_FROM_BACKEND", (payload, msg) => {
      // TODO check if already granted

      const user = this.userRouter.getUser(socket.client.id);

      if (!user) {
        console.error("User requested permission who does not exist.");
        return;
      }

      payload.permission.permissionId = this.permissionCounter++;
      this.requestedPermissions.push(payload.permission);

      // Request permission from admins
      this.userRouter.getAdmins().map((u) => u.id).forEach((clientId) => {
        this.sendToUser<SocketMessages.Permissions.UserHasRequestedPermission>(server, clientId, "@@PERM/REQUEST_FROM_ADMIN", {
          permission: payload.permission,
          user
        });
      });
    });

    this.onSocketMessage<SocketMessages.Permissions.GrantRequestedPermission>(socket, "@@PERM/GRANT", (payload, message) => {
      const perm = this.requestedPermissions.find((p) => payload.permissionId === p.permissionId);

      if (!perm) {
        return console.error(`Non existent permission ${payload.permissionId} was granted.`);
      }

      const user = this.userRouter.getUser(perm.userid);

      if (!user) {
        return console.error(`Permission on non existent user ${perm.userid} was granted.`);
      }

      this.requestedPermissions = this.requestedPermissions.filter((p) => p.permissionId !== perm.permissionId);

      this.addPermission(user.id, perm);

      this.broadcast<SocketMessages.Permissions.NotifyPermission>(server, "@@PERM/NOTIFY", {
        permission: perm,
        user,
        granted: true
      });
    });

    this.onSocketMessage<SocketMessages.Permissions.RejectRequestedPermission>(socket, "@@PERM/REJECT", (payload, message) => {
      const perm = this.requestedPermissions.find((p) => payload.permissionId === p.permissionId);
      const user = this.userRouter.getUser(perm.userid);

      if (!perm) {
        return console.error(`Non existent permission ${payload.permissionId} was rejected.`);
      } else if (!user) {
        return console.error(`Permission on non existent user ${perm.userid} was rejected.`);
      }

      this.requestedPermissions = this.requestedPermissions.filter((p) => p.permissionId !== perm.permissionId);

      this.sendToUser<SocketMessages.Permissions.NotifyPermission>(server, user.id, "@@PERM/NOTIFY", {
        permission: perm,
        user,
        granted: false
      });
    });

    this.onSocketMessage<SocketMessages.Permissions.RevokeExistingPermission>(socket, "@@PERM/REVOKE", (payload, message) => {
      let perm: IUserPermission;

      for (const userId of Object.keys(this.permissions)) {
        const findAttempt = this.permissions[userId].find((p) => p.permissionId === payload.permissionId);
        if (findAttempt) {
          perm = findAttempt;
          this.permissions[userId] = this.permissions[userId].filter((p) => p.permissionId !== perm.permissionId);
          break;
        }
      }

      const user = this.userRouter.getUser(perm.userid);

      if (!perm) {
        return console.error(`Non existent permission ${perm.userid} was revoked.`);
      } else if (!user) {
        return console.error(`Permission on non existent user ${user.id} was revoked.`);
      }

      this.broadcast<SocketMessages.Permissions.NotifyPermission>(server, "@@PERM/NOTIFY", {
        permission: perm,
        user,
        granted: false
      });
    });

    this.onSocketMessage<SocketMessages.Permissions.CreatePermission>(socket, "@@PERM/CREATE", (payload, message) => {
      const user = this.userRouter.getUser(payload.permission.userid);

      if (!user) {
        return console.error(`Permission on non existent user ${payload.permission.userid} was given.`);
      } else if (!this.userRouter.getUser(socket.client.id)) {
        return console.error("Attempted to give permission, but authoring user is not admin.");
      }

      payload.permission = this.setPermissionId(payload.permission);
      this.addPermission(payload.permission.userid, payload.permission);

      this.broadcast<SocketMessages.Permissions.NotifyPermission>(server, "@@PERM/NOTIFY", {
        permission: payload.permission,
        user,
        granted: true
      });
    });
  }

  public defineRoutes(): void {
    console.log("a");
  }

  private addPermission(userId: string, permission: IUserPermission) {
    if (!this.permissions[userId]) {
      this.permissions[userId] = [];
    }

    this.permissions[userId].push(permission);
  }

  private setPermissionId(permission: IUserPermission): IUserPermission {
    permission.permissionId = this.permissionCounter++;
    return permission;
  }
}
