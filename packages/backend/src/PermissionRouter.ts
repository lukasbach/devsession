import {SocketMessages} from "@devsession/common";
import {IFileSystemPermissionData, IUserPermission} from "@devsession/common";
import {IUser} from "@devsession/common";
import {getPathPermissions} from "@devsession/common";
import {Server, Socket} from "socket.io";
import {AbstractRouter} from "./AbstractRouter";
import {AuthenticationService} from "./AuthenticationService";

export default class PermissionRouter extends AbstractRouter {
  public readonly routerPrefix = "permissions";

  private permissions: { [userId: string]: IUserPermission[] } = {};
  private requestedPermissions: IUserPermission[] = [];
  private permissionCounter = 0;

  constructor(socketServer: Server, authService: AuthenticationService) {
    super(socketServer, authService);
  }

  public onNewSocket(socket: Socket): void {
    this.onSocketMessage<SocketMessages.Permissions.RequestPermission>(socket, "@@PERM/REQUEST_FROM_BACKEND", true, (payload, auth) => {
      // TODO check if already granted

      const user = this.getConsistentUserFromPermissions(payload.permissions, auth.userId);

      for (const permission of payload.permissions) {
        if (permission.userid !== auth.userId) {
          this.createServerError("Someone requested permissions for someone else.", [], {payload, auth});
          return;
        }

        permission.permissionId = this.getNewPermissionId();
        this.requestedPermissions.push(permission);
      }

      // Request permission from admins
      this.authService.getAdmins().map((u) => u.id).forEach((clientId) => {
        this.sendToUser<SocketMessages.Permissions.UserHasRequestedPermission>(clientId, "@@PERM/REQUEST_FROM_ADMIN", {
          permissions: payload.permissions,
          user
        });
      });
    });

    this.onSocketMessage<SocketMessages.Permissions.GrantRequestedPermission>(socket, "@@PERM/GRANT", true, (payload, auth) => {
      if (!this.authService.getUser(auth.userId).isAdmin) {
        this.createServerError("A non-admin attempted to grant permissions.", [], {payload, auth});
        return;
      }

      if (payload.permissionIds.length === 0) {
        this.createServerError("Someone attempted to grant an empty array of permissions.", [], {payload, auth});
        return;
      }

      const permissions = this.requestedPermissions.filter((p) => payload.permissionIds.includes(p.permissionId));
      const user = this.getConsistentUserFromPermissions(permissions);

      for (const perm of permissions) {
        this.addPermission(user.id, perm);
      }

      this.requestedPermissions = this.requestedPermissions.filter((p) => !payload.permissionIds.includes(p.permissionId));

      this.broadcast<SocketMessages.Permissions.NotifyPermission>("@@PERM/NOTIFY", {
        permissions,
        user,
        granted: true
      });
    });

    this.onSocketMessage<SocketMessages.Permissions.RejectRequestedPermission>(socket, "@@PERM/REJECT", true, (payload, auth) => {
      if (!this.authService.getUser(auth.userId).isAdmin) {
        this.createServerError("A non-admin attempted to reject permissions.", [], {payload, auth});
        return;
      }

      const permissions = this.requestedPermissions.filter((p) => payload.permissionIds.includes(p.permissionId));
      const user = this.getConsistentUserFromPermissions(permissions);

      this.requestedPermissions = this.requestedPermissions.filter((p) => !payload.permissionIds.includes(p.permissionId));

      this.sendToUser<SocketMessages.Permissions.NotifyPermission>(user.id, "@@PERM/NOTIFY", {
        permissions,
        user,
        granted: false
      });
    });

    this.onSocketMessage<SocketMessages.Permissions.RevokeExistingPermission>(socket, "@@PERM/REVOKE", true, (payload, auth) => {
      if (!this.authService.getUser(auth.userId).isAdmin) {
        this.createServerError("A non-admin attempted to revoke permissions.", [], {payload, auth});
        return;
      }

      const permissions: IUserPermission[] = [];

      for (const userId of Object.keys(this.permissions)) {
        permissions.push(...this.permissions[userId].filter((p) => payload.permissionIds.includes(p.permissionId)));
        this.permissions[userId] = this.permissions[userId].filter((p) => !payload.permissionIds.includes(p.permissionId));
      }

      const user = this.getConsistentUserFromPermissions(permissions);

      this.broadcast<SocketMessages.Permissions.NotifyPermission>("@@PERM/NOTIFY", {
        permissions,
        user,
        granted: false
      });
    });

    this.onSocketMessage<SocketMessages.Permissions.CreatePermission>(socket, "@@PERM/CREATE", true, (payload, auth) => {
      if (!this.authService.getUser(auth.userId).isAdmin) {
        this.createServerError("A non-admin attempted to create permissions.", [], {payload, auth});
        return;
      }

      const user = this.getConsistentUserFromPermissions(payload.permissions);

      payload.permissions = payload.permissions.map((p) => this.setPermissionId(p));
      payload.permissions.forEach((p) => this.addPermission(user.id, p));

      this.broadcast<SocketMessages.Permissions.NotifyPermission>("@@PERM/NOTIFY", {
        permissions: payload.permissions,
        user,
        granted: true
      });
    });
  }

  public defineRoutes(): void {
    // no routes
  }

  public getPathPermissionsOfUser(path: string, userId: string): IFileSystemPermissionData {
    return getPathPermissions(path, this.authService.getUser(userId), this.permissions[userId] || []);
  }

  public getUserPermissions(userId: string): IUserPermission[] {
    return this.permissions[userId] || [];
  }

  public getNewPermissionId() {
    return this.permissionCounter++;
  }

  private addPermission(userId: string, permission: IUserPermission) {
    if (!this.permissions[userId]) {
      this.permissions[userId] = [];
    }

    this.permissions[userId].push(permission);
  }

  private setPermissionId(permission: IUserPermission): IUserPermission {
    permission.permissionId = this.getNewPermissionId();
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

    if (!user) {
      throw Error("Inconsistent, wrong or invalid user scheme in permissions");
    }

    return user;
  }
}
