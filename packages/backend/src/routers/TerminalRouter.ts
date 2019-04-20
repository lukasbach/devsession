import {SocketMessages} from "@devsession/common";
import {hasUserTerminalAccess} from "@devsession/common";
import {Server, Socket} from "socket.io";
import {AbstractRouter} from "./AbstractRouter";

export default class TerminalRouter extends AbstractRouter {
  public readonly routerPrefix = "terminal";

  private openTerminals: {[terminalId: number]: string[]} = {}; // Maps to user ids

  public onNewSocket(socket: Socket): void {
    this.onSocketMessage<SocketMessages.Terminal.RequestTerminalNotifications>(socket, "@@TERMINAL/REQ", true, (payload, auth) => {
      this.validateTerminalPermission(auth.userId);

      this.terminalService.getAllTerminals().forEach((terminal) => {
        this.respond<SocketMessages.Terminal.NotifyNewTerminal>(socket, "@@TERMINAL/NOTIFY_NEW", {
          id: terminal.id,
          path: terminal.path,
          description: terminal.description
        });
      });
    });

    this.onSocketMessage<SocketMessages.Terminal.NewTerminal>(socket, "@@TERMINAL/NEW", true, (payload, auth) => {
      this.validateTerminalPermission(auth.userId);

      const terminal = this.terminalService.createTerminal(payload.path, payload.description);
      this.openTerminals[terminal.id] = [];

      this.authService.getAllUsers().filter((u) => this.hasTerminalPermission(u.id)).forEach((u) => {
        this.sendToUser<SocketMessages.Terminal.NotifyNewTerminal>(u.id, "@@TERMINAL/NOTIFY_NEW", {
          id: terminal.id,
          description: terminal.description,
          path: terminal.path
        });
      });

      terminal.process.on("data", (data) => {
        console.log("Data: ", data);
        terminal.storedOutput += data;
        this.openTerminals[terminal.id].forEach((userId) => {
          this.sendToUser<SocketMessages.Terminal.NotifyOutput>(userId, "@@TERMINAL/OUT", {
            id: terminal.id,
            data
          });
        });
      });
    });

    this.onSocketMessage<SocketMessages.Terminal.OpenTerminal>(socket, "@@TERMINAL/OPEN", true, (payload, auth) => {
      this.validateTerminalPermission(auth.userId);

      if (!this.openTerminals[payload.id].includes(auth.userId)) {
        this.openTerminals[payload.id].push(auth.userId);
        this.respond<SocketMessages.Terminal.NotifyOutput>(socket, "@@TERMINAL/OUT", {
          id: payload.id,
          data: this.terminalService.getTerminal(payload.id).storedOutput
        });
      }
    });

    this.onSocketMessage<SocketMessages.Terminal.CloseTerminal>(socket, "@@TERMINAL/CLOSE", true, (payload, auth) => {
      this.validateTerminalPermission(auth.userId);

      this.openTerminals[payload.id] = this.openTerminals[payload.id].filter((userId) => userId !== auth.userId);
    });

    this.onSocketMessage<SocketMessages.Terminal.KillTerminal>(socket, "@@TERMINAL/KILL", true, (payload, auth) => {
      this.validateTerminalPermission(auth.userId);

      const terminal = this.terminalService.getTerminal(payload.id);

      this.broadcast<SocketMessages.Terminal.NotifyKillTerminal>("@@TERMINAL/NOTIFY_KILL", {
        id: terminal.id,
        path: terminal.path,
        description: terminal.description
      });

      this.terminalService.terminateTerminal(payload.id);
      this.openTerminals[payload.id] = undefined;
    });

    this.onSocketMessage<SocketMessages.Terminal.SendInput>(socket, "@@TERMINAL/IN", true, (payload, auth) => {
      this.validateTerminalPermission(auth.userId);

      // Should not be needed as terminal input is propagated as terminal output to others
      /*this.openTerminals[payload.id].filter((u) => u !== auth.userId).forEach((userId) => {
        this.sendToUser<SocketMessages.Terminal.NotifyOutput>(userId, "@@TERMINAL/OUT", {
          id: payload.id,
          data: payload.data
        });
      });*/
      this.terminalService.getTerminal(payload.id).process.write(payload.data);
    });

  }

  public defineRoutes(): void {
    // no routes
  }

  private hasTerminalPermission(userId: string): boolean {
    const user = this.authService.getUser(userId);

    return !(!user || !hasUserTerminalAccess(user, this.permissionService.getUserPermissions(userId)));

  }

  private validateTerminalPermission(userId: string) {
    if (!this.hasTerminalPermission(userId)) {
      throw Error("User tried accessing the terminal, but does not have sufficient permissions.");
    }
  }
}
