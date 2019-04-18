import * as fs from "fs";
import * as path from "path";
import rimraf = require("rimraf");
import {Server, Socket} from "socket.io";
import {SocketMessages} from "@devsession/common/src/types/communication";
import {FSAction} from "@devsession/common/src/types/fsactions";
import {isFsActionAllowed} from "@devsession/common/src/utils/permissions";
import {getActualPathFromNormalizedPath} from "@devsession/common/src/utils/projectpath";
import {AbstractRouter} from "./AbstractRouter";
import {AuthenticationService} from "./AuthenticationService";
import {projectPath} from "./EditorRouter";
import PermissionRouter from "./PermissionRouter";

export default class FileSystemRouter extends AbstractRouter {
  public readonly routerPrefix = "fs";
  public permissionRouter: PermissionRouter;

  constructor(socketServer: Server, authService: AuthenticationService, permissionRouter: PermissionRouter) {
    super(socketServer, authService);
    this.permissionRouter = permissionRouter;
  }

  public onNewSocket(socket: Socket): void {
    this.onSocketMessage<SocketMessages.FileSystem.RequestFSAction>(socket, "@@FS/REQUEST", true, (payload, auth) => {
      const user = this.authService.getUser(auth.userId);

      if (isFsActionAllowed(payload.action, this.permissionRouter.getUserPermissions(auth.userId), user)) {
        (async () => {
          if (!(await this.operateFsAction(payload.action))) {
            this.respondUserError(socket, "An error occured during a File System operation.");
            return;
          }

          this.broadcast<SocketMessages.FileSystem.NotifyFsAction>("@@FS/NOTIFY", {
            action: payload.action,
            requestedBy: user
          });
        })();
      } else {
        this.respondUserError(socket, "No sufficient permissions for filesystem operation.");
        return console.error(`FS Action not allowed!`);
      }
    });
  }

  public defineRoutes(): void {
    // No routes
  }

  private async operateFsAction(action: FSAction): Promise<boolean> {
    return new Promise((res, rej) => {
      const callback = (err: Error) => {
        if (err) {
          this.createServerError("File system action error", [err.message], err);
          res(false);
        } else {
          res(true);
        }
      };
      switch (action.type) {
        case "create":
          const actualCreationPath = path.join(projectPath, getActualPathFromNormalizedPath(action.path), action.filename);
          if (action.isDir) {
            fs.mkdir(actualCreationPath, {}, callback);
          } else {
            fs.writeFile(actualCreationPath, "", callback);
          }
          break;

        case "rename":
          const actualPathOld = path.join(projectPath, getActualPathFromNormalizedPath(action.pathFrom));
          const actualPathNew = path.join(projectPath, getActualPathFromNormalizedPath(action.pathTo));
          fs.rename(actualPathOld, actualPathNew, callback);
          break;

        case "delete":
          const promises = Promise.all(action.paths.map((deletePath) => {
            const actualDeletionPath = path.join(projectPath, getActualPathFromNormalizedPath(deletePath));
            return new Promise((resDel, rejDel) => rimraf(actualDeletionPath, (err) => err ? rejDel(err) : resDel()));
          }))
            .then(() => res(true))
            .catch((err) => {
              this.createServerError("File system action error", [err.message], err);
              res(false);
            });
          break;

        case "copy":
          this.createServerError("Copy operation called, but not yet implemented!");
          res(false);
      }
    });
  }
}
