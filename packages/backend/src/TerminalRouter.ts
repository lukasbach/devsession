import {Server, Socket} from "socket.io";
import {SocketMessages} from "../../frontend/src/types/communication";
import {IUser} from "../../frontend/src/types/users";
import {AbstractRouter} from "./AbstractRouter";
import {AuthenticationService} from "./AuthenticationService";
import {TerminalService} from "./TerminalService";

export default class TerminalRouter extends AbstractRouter {
  public readonly routerPrefix = "terminal";

  private terminalService: TerminalService;
  private openTerminals: {[terminalId: number]: string[]} = {}; // Maps to user ids

  constructor(authService: AuthenticationService, terminalService: TerminalService) {
    super(authService);
    this.terminalService = terminalService;
  }

  public onNewSocket(socket: Socket, server: Server): void {
    this.onSocketMessage<SocketMessages.Terminal.NewTerminal>(socket, "@@TERMINAL/NEW", true, (payload, auth) => {
      const terminal = this.terminalService.createTerminal(payload.path, payload.description);
      this.openTerminals[terminal.id] = [];

      this.broadcast<SocketMessages.Terminal.NotifyNewTerminal>(server, "@@TERMINAL/NOTIFY_NEW", {
        id: terminal.id,
        description: terminal.description,
        path: terminal.path
      });

      terminal.process.stdout.on("data", (data) => {
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
      if (!this.openTerminals[payload.id].includes(auth.userId)) {
        this.openTerminals[payload.id].push(auth.userId);
        this.respond<SocketMessages.Terminal.NotifyOutput>(socket, "@@TERMINAL/OUT", {
          id: payload.id,
          data: this.terminalService.getTerminal(payload.id).storedOutput
        });
      }
    });

    this.onSocketMessage<SocketMessages.Terminal.CloseTerminal>(socket, "@@TERMINAL/CLOSE", true, (payload, auth) => {
      this.openTerminals[payload.id] = this.openTerminals[payload.id].filter((userId) => userId !== auth.userId);
    });

    this.onSocketMessage<SocketMessages.Terminal.KillTerminal>(socket, "@@TERMINAL/kill", true, (payload, auth) => {
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
      this.openTerminals[payload.id].forEach((userId) => {
        this.sendToUser<SocketMessages.Terminal.NotifyOutput>(server, userId, "@@TERMINAL/OUT", {
          id: payload.id,
          data: payload.data
        });
      });
      this.terminalService.getTerminal(payload.id).process.stdin.write(payload.data);
    });

  }

  public defineRoutes(): void {
    // no routes
  }
}
