import * as fs from "fs";
import {editor, IPosition, IRange} from "monaco-editor";
import * as path from "path";
import {Server, Socket} from "socket.io";
import {SocketMessages} from "../../frontend/src/types/communication";
import {getActualPathFromNormalizedPath, normalizeProjectPath} from "../../frontend/src/utils/projectpath";
import {AbstractRouter} from "./AbstractRouter";
import {AuthenticationService} from "./AuthenticationService";
import PermissionRouter from "./PermissionRouter";

const projectPath = "../../demodirectory";

export default class EditorRouter extends AbstractRouter {
  public readonly routerPrefix = "editor";

  private files: {
    [path: string]: { contents: string, openedByUsers: string[] }
  } = {};

  private permissionRouter: PermissionRouter;

  constructor(authService: AuthenticationService, permissionRouter: PermissionRouter) {
    super(authService);
    this.permissionRouter = permissionRouter;
  }

  public onNewSocket(socket: Socket, server: Server): void {
    this.onSocketMessage<SocketMessages.Editor.OpenedFile>(socket, "@@EDITOR/OPEN_FILE", true, (payload, auth) => {
      payload.path = normalizeProjectPath(payload.path);
      const actualPath = path.join(projectPath, getActualPathFromNormalizedPath(payload.path));

      if (!this.permissionRouter.getPathPermissionsOfUser(payload.path, auth.userId).mayRead) {
        return;
      }

      if (this.isOpened(payload.path)) {
        this.files[payload.path].openedByUsers.push(auth.userId);
      } else {
        fs.readFile(actualPath, (err, data) => {
          if (err) {
            console.log(`Error during editor/openfile when opening ${getActualPathFromNormalizedPath(payload.path)}`);
            console.error(err);
          } else {
            this.files[payload.path] = {
              contents: data.toString("utf8"),
              openedByUsers: [auth.userId]
            };
          }
        });
      }
    });

    this.onSocketMessage<SocketMessages.Editor.ClosedFile>(socket, "@@EDITOR/CLOSE_FILE", true, (payload, auth) => {
      payload.path = normalizeProjectPath(payload.path);
      const actualPath = path.join(projectPath, getActualPathFromNormalizedPath(payload.path));

      if (this.isOpened(payload.path)) {
        this.files[payload.path].openedByUsers = this.files[payload.path].openedByUsers.filter((user) => user !== auth.userId);
        if (this.files[payload.path].openedByUsers.length === 0) {
          fs.writeFile(actualPath, this.files[payload.path].contents, (err) => {
            if (err) {
              console.log(`Error during editor/closefile when writing ${getActualPathFromNormalizedPath(payload.path)}`);
              console.error(err);
            }
          });
          this.files[payload.path] = undefined;
        }
      }
    });

    this.onSocketMessage<SocketMessages.Editor.ChangedText>(socket, "@@EDITOR/CHANGED_TEXT", true, (payload, auth) => {
      payload.path = normalizeProjectPath(payload.path);

      if (!this.permissionRouter.getPathPermissionsOfUser(payload.path, auth.userId).mayWrite) {
        return;
      }

      if (!this.isOpened(payload.path)) {
        return console.error(`Accessing ${payload.path} even though it is not opened.`);
      }

      payload.changes.forEach((change) => this.applyChange(payload.path, change));

      this.forward<SocketMessages.Editor.NotifyChangedText>(socket, "@@EDITOR/NOTIFY_CHANGED_TEXT", {
        user: auth.userId,
        changes: payload.changes,
        path: payload.path
      });
    });
  }

  public defineRoutes(): void {
    this.router.get("/dir", ((req, res) => {
      const requestedPath = normalizeProjectPath(req.query.path);
      const actualPath = path.join(projectPath, getActualPathFromNormalizedPath(requestedPath));

      // TODO AUTH

      fs.readdir(actualPath, (err, files) => {
        if (err) {
          console.error("Error occured during /dir/:path");
          console.log(err);
        } else {
          res.send({
            files: files.map((f) => ({ path: path.join(requestedPath, f), filename: f, isDir: !f.includes(".") }))
          });
        }
      });
    }));

    this.router.get("/contents", ((req, res) => {
      const requestedPath = normalizeProjectPath(req.query.path);
      const actualPath = path.join(projectPath, getActualPathFromNormalizedPath(requestedPath));
      // TODO AUTH

      fs.readFile(actualPath, { encoding: "utf8" }, (err, file) => {
        if (err) {
          console.error("Error occured during /dir/:path");
          console.log(err);
        } else {
          res.send({
            path: requestedPath,
            fileName: path.basename(requestedPath),
            contents: file
          });
        }
      });
    }));
  }

  private isOpened(filePath: string) {
    return Object.keys(this.files).includes(filePath) && !!this.files[filePath];
  }

  private applyChange(filePath: string, change: editor.IModelContentChange) {
    try {
      let lines = this.files[filePath].contents.split("\n");

      const before = lines[change.range.startLineNumber - 1].substr(0, change.range.startColumn - 1);
      const after = lines[change.range.endLineNumber - 1].substr(change.range.endColumn - 1);

      lines = [
        ...lines.filter((l, i) => i < change.range.startLineNumber - 1),
        before + change.text + after,
        ...lines.filter((l, i) => i > change.range.endLineNumber - 1)
      ];

      this.files[filePath].contents = lines.join("\n");
    } catch (e) {
      console.log(`Could not apply change to ${filePath}`);
      console.log(`Change was: ${JSON.stringify(change)}`);

      throw Error();
    }
  }
}
