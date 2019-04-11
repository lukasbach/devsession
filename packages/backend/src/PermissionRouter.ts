import {Server, Socket} from "socket.io";
import {SocketMessages} from "../../frontend/src/types/communication";
import {IFileSystemPermissionData, IUserPermission} from "../../frontend/src/types/permissions";
import {IUser} from "../../frontend/src/types/users";
import {getPathPermissions} from "../../frontend/src/utils/permissions";
import {AbstractRouter} from "./AbstractRouter";
import {AuthenticationService} from "./AuthenticationService";

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

      const user = this.getConsistentUserFromPermissions(payload.permissions, auth.userId);

      if (!user) {
        return console.error("Inconsistent, wrong or invalid user scheme in permissions.");
      }

      for (const permission of payload.permissions) {
        if (permission.userid !== auth.userId) {
          return console.error("Requested permission for someone else.");
        }

        permission.permissionId = this.permissionCounter++;
        this.requestedPermissions.push(permission);
      }

      // Request permission from admins
      this.authService.getAdmins().map((u) => u.id).forEach((clientId) => {
        this.sendToUser<SocketMessages.Permissions.UserHasRequestedPermission>(server, clientId, "@@PERM/REQUEST_FROM_ADMIN", {
          permissions: payload.permissions,
          user
        });
      });
    });

    this.onSocketMessage<SocketMessages.Permissions.GrantRequestedPermission>(socket, "@@PERM/GRANT", true, (payload, auth) => {
      if (!this.authService.getUser(auth.userId).isAdmin) {
        return console.error(`A non-admin can not grant permissions.`);
      }

      if (payload.permissionIds.length === 0) {
        return console.log("Empty array of permissions granted.");
      }

      const permissions = this.requestedPermissions.filter((p) => payload.permissionIds.includes(p.permissionId));
      const user = this.getConsistentUserFromPermissions(permissions);

      if (!user) {
        return console.error("Inconsistent or wrong user scheme in permissions.");
      }

      for (const perm of permissions) {
        this.addPermission(user.id, perm);
      }

      this.requestedPermissions = this.requestedPermissions.filter((p) => !payload.permissionIds.includes(p.permissionId));

      this.broadcast<SocketMessages.Permissions.NotifyPermission>(server, "@@PERM/NOTIFY", {
        permissions,
        user,
        granted: true
      });
    });

    this.onSocketMessage<SocketMessages.Permissions.RejectRequestedPermission>(socket, "@@PERM/REJECT", true, (payload, auth) => {
      if (!this.authService.getUser(auth.userId).isAdmin) {
        return console.error(`A non-admin can not reject permissions.`);
      }

      const permissions = this.requestedPermissions.filter((p) => payload.permissionIds.includes(p.permissionId));
      const user = this.getConsistentUserFromPermissions(permissions);

      if (!user) {
        return console.error("Permissions for distinct users rejected.");
      }

      this.requestedPermissions = this.requestedPermissions.filter((p) => !payload.permissionIds.includes(p.permissionId));

      this.sendToUser<SocketMessages.Permissions.NotifyPermission>(server, user.id, "@@PERM/NOTIFY", {
        permissions,
        user,
        granted: false
      });
    });

    this.onSocketMessage<SocketMessages.Permissions.RevokeExistingPermission>(socket, "@@PERM/REVOKE", true, (payload, auth) => {
      if (!this.authService.getUser(auth.userId).isAdmin) {
        return console.error(`A non-admin can not revoke permissions.`);
      }

      const permissions: IUserPermission[] = [];

      for (const userId of Object.keys(this.permissions)) {
        permissions.push(...this.permissions[userId].filter((p) => payload.permissionIds.includes(p.permissionId)));
        this.permissions[userId] = this.permissions[userId].filter((p) => !payload.permissionIds.includes(p.permissionId));
      }

      const user = this.getConsistentUserFromPermissions(permissions);

      if (!user) {
        return console.error("Permissions for distinct users revoked.");
      }

      this.broadcast<SocketMessages.Permissions.NotifyPermission>(server, "@@PERM/NOTIFY", {
        permissions,
        user,
        granted: false
      });
    });

    this.onSocketMessage<SocketMessages.Permissions.CreatePermission>(socket, "@@PERM/CREATE", true, (payload, auth) => {
      if (!this.authService.getUser(auth.userId).isAdmin) {
        return console.error(`A non-admin can not create permissions.`);
      }

      const user = this.getConsistentUserFromPermissions(payload.permissions);

      if (!user) {
        return console.error(`Permission given on inconsistent users.`);
      }

      payload.permissions = payload.permissions.map((p) => this.setPermissionId(p));
      payload.permissions.forEach((p) => this.addPermission(user.id, p));

      this.broadcast<SocketMessages.Permissions.NotifyPermission>(server, "@@PERM/NOTIFY", {
        permissions: payload.permissions,
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

  public getUserPermissions(userId: string): IUserPermission[] {
    return this.permissions[userId] || [];
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

  /**
   * Check if all permissions have the same user. Also validate all user ids against shouldBeUserId if supplied.
   * Returns the user if everything is correct. Returns null if permission array is empty or permissions have
   * distinct users.
   */
  private getConsistentUserFromPermissions(permissions: IUserPermission[], shouldBeUserId?: string): IUser | null {
    let user: IUser | null = null;

    for (const perm of permissions) {
      if (user && user.id !== perm.userid) {
        return null;
      }

      if (shouldBeUserId && perm.userid !== shouldBeUserId) {
        return null;
      }

      if (!user) {
        user = this.authService.getUser(perm.userid) || null;
      }
    }

    return user;
  }
}
