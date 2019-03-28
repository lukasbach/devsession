import {Server, Socket} from "socket.io";
import {find} from "tslint/lib/utils";
import {SocketMessages} from "../../frontend/src/types/communication";
import {IFileSystemPermissionData, IUserPermission} from "../../frontend/src/types/permissions";
import {IUser} from "../../frontend/src/types/users";
import {getPathPermissions} from "../../frontend/src/utils/permissions";
import {AbstractRouter} from "./AbstractRouter";
import {AuthenticationService} from "./AuthenticationService";
import UserRouter from "./UserRouter";

export default class PermissionRouter extends AbstractRouter {
  public readonly routerPrefix = "permissions";

  private permissions: { [userId: string]: IUserPermission[] } = {};
  private requestedPermissions: IUserPermission[] = [];
  private permissionCounter = 0;

  constructor(authService: AuthenticationService) {
    super(authService);
  }

  public onNewSocket(socket: Socket, server: Server): void {
    this.onSocketMessage<SocketMessages.Permissions.RequestPermission>(socket, "@@PERM/REQUEST_FROM_BACKEND", true, (payload, auth) => {
      // TODO check if already granted

      const user = this.authService.getUser(auth.userId);

      if (!user) {
        console.error("User requested permission who does not exist.");
        return;
      }

      payload.permission.permissionId = this.permissionCounter++;
      this.requestedPermissions.push(payload.permission);

      // Request permission from admins
      this.authService.getAdmins().map((u) => u.id).forEach((clientId) => {
        this.sendToUser<SocketMessages.Permissions.UserHasRequestedPermission>(server, clientId, "@@PERM/REQUEST_FROM_ADMIN", {
          permission: payload.permission,
          user
        });
      });
    });

    this.onSocketMessage<SocketMessages.Permissions.GrantRequestedPermission>(socket, "@@PERM/GRANT", true, (payload, auth) => {
      if (!this.authService.getUser(auth.userId).isAdmin) {
        return console.error(`A non-admin can not grant permissions.`);
      }

      const perm = this.requestedPermissions.find((p) => payload.permissionId === p.permissionId);

      if (!perm) {
        return console.error(`Non existent permission ${payload.permissionId} was granted.`);
      }

      const user = this.authService.getUser(perm.userid);

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

    this.onSocketMessage<SocketMessages.Permissions.RejectRequestedPermission>(socket, "@@PERM/REJECT", true, (payload, auth) => {
      if (!this.authService.getUser(auth.userId).isAdmin) {
        return console.error(`A non-admin can not reject permissions.`);
      }

      const perm = this.requestedPermissions.find((p) => payload.permissionId === p.permissionId);
      const user = this.authService.getUser(perm.userid);

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

    this.onSocketMessage<SocketMessages.Permissions.RevokeExistingPermission>(socket, "@@PERM/REVOKE", true, (payload, auth) => {
      if (!this.authService.getUser(auth.userId).isAdmin) {
        return console.error(`A non-admin can not revoke permissions.`);
      }

      let perm: IUserPermission;

      for (const userId of Object.keys(this.permissions)) {
        const findAttempt = this.permissions[userId].find((p) => p.permissionId === payload.permissionId);
        if (findAttempt) {
          perm = findAttempt;
          this.permissions[userId] = this.permissions[userId].filter((p) => p.permissionId !== perm.permissionId);
          break;
        }
      }

      const user = this.authService.getUser(perm.userid);

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

    this.onSocketMessage<SocketMessages.Permissions.CreatePermission>(socket, "@@PERM/CREATE", true, (payload, auth) => {
      if (!this.authService.getUser(auth.userId).isAdmin) {
        return console.error(`A non-admin can not create permissions.`);
      }

      const user = this.authService.getUser(payload.permission.userid);

      if (!user) {
        return console.error(`Permission on non existent user ${payload.permission.userid} was given.`);
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

  public getPathPermissionsOfUser(path: string, userId: string): IFileSystemPermissionData {
    return getPathPermissions(path, this.authService.getUser(userId), this.permissions[userId] || []);
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
