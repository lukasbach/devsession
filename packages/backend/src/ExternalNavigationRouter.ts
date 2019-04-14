import {Server, Socket} from "socket.io";
import {SocketMessages} from "../../frontend/src/types/communication";
import {IUserEditorPositionWithRequiredPath} from "../../frontend/src/types/editor";
import {IFileSystemPermission} from "../../frontend/src/types/permissions";
import {getPathPermissions} from "../../frontend/src/utils/permissions";
import {AbstractRouter} from "./AbstractRouter";
import {AuthenticationService} from "./AuthenticationService";
import PermissionRouter from "./PermissionRouter";

export class ExternalNavigationRouter extends AbstractRouter {
  public routerPrefix = "externalnav";

  private permissionRouter: PermissionRouter;

  constructor(socketServer: Server, authService: AuthenticationService, permissionRouter: PermissionRouter) {
    super(socketServer, authService);
    this.permissionRouter = permissionRouter;
  }

  public onNewSocket(socket: Socket): void {
    this.onSocketMessage<SocketMessages.ExternalNavigation.ExternalNavigationRequest>(socket, "@@EXTERNALNAV/REQ", true, (payload, auth) => {
      const authoringUser = this.authService.getUser(auth.userId)!;
      const position = payload.position || authoringUser.position;

      const userIds = payload.userIds || this.authService.getAllUsers().filter((u) => u.id !== authoringUser.id).map((u) => u.id);

      if (!position.path) {
        return;
      }

      userIds.forEach((id) => {
        const user = this.authService.getUser(id)!; // User existence is checked in this.sendToUser

        this.sendToUser<SocketMessages.ExternalNavigation.ExternalNavigationNotify>(id, "@@EXTERNALNAV/NOTIFY", {
          authoringUser, position: position as IUserEditorPositionWithRequiredPath
        });

        // Check permissions and request if not present
        if (!getPathPermissions(position.path, user, this.permissionRouter.getUserPermissions(id)).mayRead) {
          // TODO
        }
      });
    });
  }

  public defineRoutes(): void {
    // No routes
  }
}
