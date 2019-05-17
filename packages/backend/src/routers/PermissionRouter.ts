import {SocketMessages} from "@devsession/common";
import {Socket} from "socket.io";
import {AbstractRouter} from "./AbstractRouter";

export default class PermissionRouter extends AbstractRouter {
  public readonly routerPrefix = "permissions";

  public onNewSocket(socket: Socket): void {
    this.onSocketMessage<SocketMessages.Permissions.RequestPermission>(socket, "@@PERM/REQUEST_FROM_BACKEND", true, (payload, auth) => {
      // TODO check if already granted

      const user = this.permissionService.getConsistentUserFromPermissions(payload.permissions, auth.userId);

      for (const permission of payload.permissions) {
        if (permission.userid !== auth.userId) {
          this.createServerError("Someone requested permissions for someone else.", [], {payload, auth});
          return;
        }

        permission.permissionId = this.permissionService.getNewPermissionId();
        this.permissionService.storePermission(permission);
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

      const permissions = this.permissionService.grantPermissions(payload.permissionIds);
      const user = this.permissionService.getConsistentUserFromPermissions(permissions);

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

      const permissions = this.permissionService.rejectPermissions(payload.permissionIds);
      const user = this.permissionService.getConsistentUserFromPermissions(permissions);

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

      const permissions = this.permissionService.revokePermissions(payload.permissionIds);
      const user = this.permissionService.getConsistentUserFromPermissions(permissions);

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

      const user = this.permissionService.getConsistentUserFromPermissions(payload.permissions);
      this.permissionService.createPermissions(payload.permissions);

      this.broadcast<SocketMessages.Permissions.NotifyPermission>("@@PERM/NOTIFY", {
        permissions: payload.permissions,
        user,
        granted: true
      });
    });

    this.onSocketMessage<SocketMessages.Permissions.SetInitialPermissions>(socket, "@@SERVERCONTROL/SETPERM", true, (payload, auth) => {
      if (!this.authService.getUser(auth.userId).isAdmin) {
        this.createServerError("A non-admin attempted to set initial permissions.", [], {payload, auth});
        return;
      }

      this.permissionService.setInitialPermissions(payload.initialPermissions);
    });
  }

  public defineRoutes(): void {
    // no routes
  }

}
