import {SocketMessages} from "@devsession/common";
import {IUserEditorPositionWithRequiredPath} from "@devsession/common";
import {getPathPermissions} from "@devsession/common";
import {Socket} from "socket.io";
import {AbstractRouter} from "./AbstractRouter";

export class ExternalNavigationRouter extends AbstractRouter {
  public routerPrefix = "externalnav";

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
        if (!getPathPermissions(position.path, user, this.permissionService.getUserPermissions(id)).mayRead) {
          // TODO
        }
      });
    });
  }

  public defineRoutes(): void {
    // No routes
  }
}
