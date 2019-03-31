import {Server, Socket} from "socket.io";
import {SocketMessages} from "../../frontend/src/types/communication";
import {hasUserTerminalAccess} from "../../frontend/src/utils/permissions";
import {AbstractRouter} from "./AbstractRouter";
import {AuthenticationService} from "./AuthenticationService";
import PermissionRouter from "./PermissionRouter";
import {TerminalService} from "./TerminalService";

export default class TerminalRouter extends AbstractRouter {
  public readonly routerPrefix = "terminal";

  private terminalService: TerminalService;
  private permissionRouter: PermissionRouter;

  private openTerminals: {[terminalId: number]: string[]} = {}; // Maps to user ids

  constructor(authService: AuthenticationService, terminalService: TerminalService, permissionRouter: PermissionRouter) {
    super(authService);
    this.terminalService = terminalService;
    this.permissionRouter = permissionRouter;
  }

  public onNewSocket(socket: Socket, server: Server): void {
    this.onSocketMessage<SocketMessages.Terminal.RequestTerminalNotifications>(socket, "@@TERMINAL/REQ", true, (payload, auth) => {
      if (!this.validateTerminalPermission(auth.userId)) {
        return console.error("User sends terminal request, but does not have sufficient permissions.");
      }

      this.terminalService.getAllTerminals().forEach((terminal) => {
        this.respond<SocketMessages.Terminal.NotifyNewTerminal>(socket, "@@TERMINAL/NOTIFY_NEW", {
          id: terminal.id,
          path: terminal.path,
          description: terminal.description
        });
      });
    });

    this.onSocketMessage<SocketMessages.Terminal.NewTerminal>(socket, "@@TERMINAL/NEW", true, (payload, auth) => {
      if (!this.validateTerminalPermission(auth.userId)) {
        return console.error("User sends terminal request, but does not have sufficient permissions.");
      }

      const terminal = this.terminalService.createTerminal(payload.path, payload.description);
      this.openTerminals[terminal.id] = [];

      this.authService.getAllUsers().filter((u) => this.validateTerminalPermission(u.id)).forEach((u) => {
        this.sendToUser<SocketMessages.Terminal.NotifyNewTerminal>(server, u.id, "@@TERMINAL/NOTIFY_NEW", {
          id: terminal.id,
          description: terminal.description,
          path: terminal.path
        });
      });

      terminal.process.on("data", (data) => {
        console.log("Data: ", data);
        terminal.storedOutput += data;
        this.openTerminals[terminal.id].forEach((userId) => {
          this.sendToUser<SocketMessages.Terminal.NotifyOutput>(server, userId, "@@TERMINAL/OUT", {
            id: terminal.id,
            data
          });
        });
      });
    });

    this.onSocketMessage<SocketMessages.Terminal.OpenTerminal>(socket, "@@TERMINAL/OPEN", true, (payload, auth) => {
      if (!this.validateTerminalPermission(auth.userId)) {
        return console.error("User sends terminal request, but does not have sufficient permissions.");
      }

      if (!this.openTerminals[payload.id].includes(auth.userId)) {
        this.openTerminals[payload.id].push(auth.userId);
        this.respond<SocketMessages.Terminal.NotifyOutput>(socket, "@@TERMINAL/OUT", {
          id: payload.id,
          data: this.terminalService.getTerminal(payload.id).storedOutput
        });
      }
    });

    this.onSocketMessage<SocketMessages.Terminal.CloseTerminal>(socket, "@@TERMINAL/CLOSE", true, (payload, auth) => {
      if (!this.validateTerminalPermission(auth.userId)) {
        return console.error("User sends terminal request, but does not have sufficient permissions.");
      }

      this.openTerminals[payload.id] = this.openTerminals[payload.id].filter((userId) => userId !== auth.userId);
    });

    this.onSocketMessage<SocketMessages.Terminal.KillTerminal>(socket, "@@TERMINAL/KILL", true, (payload, auth) => {
      if (!this.validateTerminalPermission(auth.userId)) {
        return console.error("User sends terminal request, but does not have sufficient permissions.");
      }

      const terminal = this.terminalService.getTerminal(payload.id);

      this.broadcast<SocketMessages.Terminal.NotifyKillTerminal>(server, "@@TERMINAL/NOTIFY_KILL", {
        id: terminal.id,
        path: terminal.path,
        description: terminal.description
      });

      this.terminalService.terminateTerminal(payload.id);
      this.openTerminals[payload.id] = undefined;
    });

    this.onSocketMessage<SocketMessages.Terminal.SendInput>(socket, "@@TERMINAL/IN", true, (payload, auth) => {
      if (!this.validateTerminalPermission(auth.userId)) {
        return console.error("User sends terminal request, but does not have sufficient permissions.");
      }

      this.openTerminals[payload.id].filter((u) => u !== auth.userId).forEach((userId) => {
        this.sendToUser<SocketMessages.Terminal.NotifyOutput>(server, userId, "@@TERMINAL/OUT", {
          id: payload.id,
          data: payload.data
        });
      });
      this.terminalService.getTerminal(payload.id).process.write(payload.data);
    });

  }

  public defineRoutes(): void {
    // no routes
  }

  private validateTerminalPermission(userId: string) {
    const user = this.authService.getUser(userId);

    if (!user) {
      return false;
    }

    return hasUserTerminalAccess(user, this.permissionRouter.getUserPermissions(userId));
  }
}
