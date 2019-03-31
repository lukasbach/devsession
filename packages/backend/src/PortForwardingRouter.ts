import {Server, Socket} from "socket.io";
import {SocketMessages} from "../../frontend/src/types/communication";
import {AbstractRouter} from "./AbstractRouter";
import {AuthenticationService} from "./AuthenticationService";
import {PortForwardingService} from "./PortForwardingService";

export default class PortForwardingRouter extends AbstractRouter {
  public readonly routerPrefix = "portforwarding";

  private portForwardingService: PortForwardingService;

  constructor(authService: AuthenticationService, portForwardingService: PortForwardingService) {
    super(authService);

    this.portForwardingService = portForwardingService;
  }

  public onNewSocket(socket: Socket, server: Server): void {
    this.onSocketMessage<SocketMessages.PortForwarding.NewConfig>(socket, "@@PORTFORWARDING/NEW", true, (payload, auth) => {
      // TODO PERMISSIONS
      const authoringUser = this.authService.getUser(auth.userId)!;

      (async () => {
        const config = await this.portForwardingService.createNewConfiguration(payload.config);

        this.broadcast<SocketMessages.PortForwarding.NotifyNewConfig>(server, "@@PORTFORWARDING/NOTIFY_NEW", {
          config, authoringUser
        });
      })();
    });

    this.onSocketMessage<SocketMessages.PortForwarding.DeleteConfig>(socket, "@@PORTFORWARDING/DELETE", true, (payload, auth) => {
      // TODO PERMISSIONS
      const authoringUser = this.authService.getUser(auth.userId)!;

      (async () => {
        const config = await this.portForwardingService.getConfig(payload.configId);
        await this.portForwardingService.deleteConfig(payload.configId);

        this.broadcast<SocketMessages.PortForwarding.NotifyDeleteConfig>(server, "@@PORTFORWARDING/NOTIFY_DELETE", {
          config, authoringUser
        });
      })();

    });
  }

  public defineRoutes(): void {
    // no routes
  }
}
