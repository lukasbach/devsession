import {Server, Socket} from "socket.io";
import {SocketMessages} from "../../frontend/src/types/communication";
import {hasUserPortForwardingAccess} from "../../frontend/src/utils/permissions";
import {AbstractRouter} from "./AbstractRouter";
import {AuthenticationService} from "./AuthenticationService";
import PermissionRouter from "./PermissionRouter";
import {PortForwardingService} from "./PortForwardingService";

export default class PortForwardingRouter extends AbstractRouter {
  public readonly routerPrefix = "portforwarding";

  private portForwardingService: PortForwardingService;
  private permissionRouter: PermissionRouter;

  constructor(authService: AuthenticationService, portForwardingService: PortForwardingService, permissionRouter: PermissionRouter) {
    super(authService);

    this.portForwardingService = portForwardingService;
    this.permissionRouter = permissionRouter;
  }

  public onNewSocket(socket: Socket, server: Server): void {
    this.onSocketMessage<SocketMessages.PortForwarding.NewConfig>(socket, "@@PORTFORWARDING/NEW", true, (payload, auth) => {
      const authoringUser = this.authService.getUser(auth.userId)!;

      if (!hasUserPortForwardingAccess(authoringUser, this.permissionRouter.getUserPermissions(authoringUser.id))) {
        return console.error("User tried adding port forwarding, but does not have sufficient permissions.");
      }

      (async () => {
        try {
          const config = await this.portForwardingService.createNewConfiguration(payload.config);

          this.broadcast<SocketMessages.PortForwarding.NotifyNewConfig>(server, "@@PORTFORWARDING/NOTIFY_NEW", {
            config, authoringUser
          });
        } catch (e) {
          console.error("Could not create port forwarding config. Error was:");
          console.log(e);
        }
      })();
    });

    this.onSocketMessage<SocketMessages.PortForwarding.DeleteConfig>(socket, "@@PORTFORWARDING/DELETE", true, (payload, auth) => {
      const authoringUser = this.authService.getUser(auth.userId)!;

      if (!hasUserPortForwardingAccess(authoringUser, this.permissionRouter.getUserPermissions(authoringUser.id))) {
        return console.error("User tried deleting port forwarding, but does not have sufficient permissions.");
      }

      (async () => {
        const config = await this.portForwardingService.getConfig(payload.configId);
        await this.portForwardingService.deleteConfig(payload.configId);

        this.broadcast<SocketMessages.PortForwarding.NotifyDeleteConfig>(server, "@@PORTFORWARDING/NOTIFY_DELETE", {
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
}
