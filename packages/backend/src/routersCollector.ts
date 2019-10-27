import * as core from "express-serve-static-core";
import {Server} from "socket.io";
import {AbstractRouter} from "./routers/AbstractRouter";
import EditorRouter from "./routers/EditorRouter";
import {ExternalNavigationRouter} from "./routers/ExternalNavigationRouter";
import FileSystemRouter from "./routers/FileSystemRouter";
import PermissionRouter from "./routers/PermissionRouter";
import PortForwardingRouter from "./routers/PortForwardingRouter";
import TerminalRouter from "./routers/TerminalRouter";
import UserRouter from "./routers/UserRouter";
import {IServerSettings} from "./ServerSettings";
import {AuthenticationService} from "./services/AuthenticationService";
import {PermissionService} from "./services/PermissionService";
import {PortForwardingService} from "./services/PortForwardingService";
import {TerminalService} from "./services/TerminalService";

export const prepareRouters = (socketServer: Server, expressApp: core.Express, settings: IServerSettings) => {
  const authService = new AuthenticationService(settings);
  const terminalService = new TerminalService(settings);
  const portForwardingService = new PortForwardingService();
  const permissionService = new PermissionService(authService);

  const p = [socketServer, authService, permissionService, portForwardingService, terminalService, settings] as [
    Server,
    AuthenticationService,
    PermissionService,
    PortForwardingService,
    TerminalService,
    IServerSettings
  ]; // as const is better, but maybe not fully supported by intellij?

  const editorRouter = new EditorRouter(...p);

  const routers: AbstractRouter[] = [
    new UserRouter(...p),
    new PermissionRouter(...p),
    new FileSystemRouter(...p),
    new TerminalRouter(...p),
    new PortForwardingRouter(...p),
    new ExternalNavigationRouter(...p),
    editorRouter
  ];

  for (const router of routers) {
    router.verbose = settings.verbose;
  }

  routers.forEach((router) => {
    router.defineRoutes();
    router.applyToExpress(expressApp);
  });

  socketServer.on("connection", (socket) => {
    routers.forEach((router) => router.onNewSocket(socket));
  });

  return {
    close: () => {
      editorRouter.saveAllFiles();
    }
  };
};
