import {SocketMessages} from "@devsession/common";
import {IUserPermission} from "@devsession/common";
import {IUser} from "@devsession/common";
import {hasUserPortForwardingAccess} from "@devsession/common";
import {Server, Socket} from "socket.io";
import {AbstractRouter} from "./AbstractRouter";
import {AuthenticationService} from "./AuthenticationService";
import PermissionRouter from "./PermissionRouter";
import {PortForwardingService} from "./PortForwardingService";

export default class PortForwardingRouter extends AbstractRouter {
  public readonly routerPrefix = "portforwarding";

  private portForwardingService: PortForwardingService;
  private permissionRouter: PermissionRouter;

  constructor(socketServer: Server, authService: AuthenticationService, portForwardingService: PortForwardingService, permissionRouter: PermissionRouter) {
    super(socketServer, authService);

    this.portForwardingService = portForwardingService;
    this.permissionRouter = permissionRouter;
  }

  public onNewSocket(socket: Socket): void {
    this.onSocketMessage<SocketMessages.PortForwarding.NewConfig>(socket, "@@PORTFORWARDING/NEW", true, (payload, auth) => {
      const authoringUser = this.authService.getUser(auth.userId)!;

      this.validatePermissions(authoringUser, this.permissionRouter.getUserPermissions(authoringUser.id));

      (async () => {
        try {
          const config = await this.portForwardingService.createNewConfiguration(payload.config);

          this.broadcast<SocketMessages.PortForwarding.NotifyNewConfig>("@@PORTFORWARDING/NOTIFY_NEW", {
            config, authoringUser
          });
        } catch (e) {
          this.respondUserError(socket, `Port Forwarding Config could not be created because: ${e.message}`, [e.details ? JSON.stringify(e.details) : ""]);
        }
      })();
    });

    this.onSocketMessage<SocketMessages.PortForwarding.DeleteConfig>(socket, "@@PORTFORWARDING/DELETE", true, (payload, auth) => {
      const authoringUser = this.authService.getUser(auth.userId)!;

      this.validatePermissions(authoringUser, this.permissionRouter.getUserPermissions(authoringUser.id));

      (async () => {
        const config = await this.portForwardingService.getConfig(payload.configId);

        try {
          await this.portForwardingService.deleteConfig(payload.configId);
        } catch (e) {
          this.respondUserError(socket, e.message);
          return;
        }

        this.broadcast<SocketMessages.PortForwarding.NotifyDeleteConfig>("@@PORTFORWARDING/NOTIFY_DELETE", {
          config, authoringUser
        });
      })();
    });

    this.onSocketMessage<SocketMessages.PortForwarding.RequestNotifications>(socket, "@@PORTFORWARDING/REQ", true, ((payload, auth) => {
      for (const config of this.portForwardingService.getAllConfigs()) {
        this.respond<SocketMessages.PortForwarding.NotifyNewConfig>(socket, "@@PORTFORWARDING/NOTIFY_NEW", {
          config,
          authoringUser: {
            id: "__SYS",
            name: "System",
            isAdmin: false,
            position: {}
          },
          dontAlert: true
        });
      }
    }));
  }

  public defineRoutes(): void {
    // no routes
  }

  private validatePermissions(user: IUser, permissions: IUserPermission[]) {
    if (!hasUserPortForwardingAccess(user, permissions)) {
      throw Error("An user tried to modify port forwarding settings, but does not have the sufficient permissions.");
    }
  }
}
