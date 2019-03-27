import * as fs from "fs";
import * as path from "path";
import {Server, Socket} from "socket.io";
import {SocketMessages} from "../../frontend/src/types/communication";
import {IChange} from "../../frontend/src/types/editor";
import {getActualPathFromNormalizedPath, normalizeProjectPath} from "../../frontend/src/utils/projectpath";
import {AbstractRouter} from "./AbstractRouter";

const projectPath = "../../demodirectory";

export default class EditorRouter extends AbstractRouter {
  public readonly routerPrefix = "editor";

  private files: {
    [path: string]: { contents: string, openedByUsers: string[] }
  } = {};

  public onNewSocket(socket: Socket, server: Server): void {
    this.onSocketMessage<SocketMessages.Editor.OpenedFile>(socket, "@@EDITOR/OPEN_FILE", (payload) => {
      payload.path = normalizeProjectPath(payload.path);

      if (!this.isAccessAllowed(payload.path)) {
        return;
      }

      if (this.isOpened(payload.path)) {
        this.files[payload.path].openedByUsers.push(payload.user);
      } else {
        fs.readFile(getActualPathFromNormalizedPath(payload.path), (err, data) => {
          if (err) {
            console.error(err);
          } else {
            this.files[payload.path] = {
              contents: data.toString("utf8"),
              openedByUsers: [payload.user]
            };
          }
        });
      }
    });

    this.onSocketMessage<SocketMessages.Editor.ClosedFile>(socket, "@@EDITOR/CLOSE_FILE", (payload) => {
      payload.path = normalizeProjectPath(payload.path);

      if (this.isOpened(payload.path)) {
        this.files[payload.path].openedByUsers = this.files[payload.path].openedByUsers.filter((user) => user !== payload.user);
        if (this.files[payload.path].openedByUsers.length === 0) {
          if (this.isAccessAllowed(payload.path)) {
            fs.writeFile(getActualPathFromNormalizedPath(payload.path), this.files[payload.path].contents, (err) => {
              if (err) {
                console.error(err);
              }
            });
          }
          this.files[payload.path] = undefined;
        }
      }
    });

    this.onSocketMessage<SocketMessages.Editor.ChangedText>(socket, "@@EDITOR/CHANGED_TEXT", (payload, msg) => {
      payload.path = normalizeProjectPath(payload.path);

      if (!this.isAccessAllowed(payload.path)) {
        return;
      }

      if (!this.isOpened(payload.path)) {
        return console.error(`Accessing ${payload.path} even though it is not opened.`);
      }

      payload.changes.forEach((change) => this.applyChange(payload.path, change));

      this.forward(socket, msg.message, msg.payload);
    });
  }

  public defineRoutes(): void {
    this.router.get("/dir", ((req, res) => {
      const requestedPath = normalizeProjectPath(req.query.path);

      fs.readdir(path.join(projectPath, getActualPathFromNormalizedPath(requestedPath)), (err, files) => {
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

      fs.readFile(path.join(projectPath, getActualPathFromNormalizedPath(requestedPath)), { encoding: "utf8" }, (err, file) => {
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

  private isAccessAllowed(accessPath: string) {
    return true;
  }

  private applyChange(filePath: string, change: IChange) {
    let lines = this.files[filePath].contents.split("\n");

    const before = lines[change.range.startLineNumber - 1].substr( 0, change.range.startColumn - 1);
    const after = lines[change.range.endLineNumber - 1].substr(change.range.endColumn - 1);

    lines = [
      ...lines.filter((l, i) => i < change.range.startLineNumber - 1),
      before + change.text + after,
      ...lines.filter((l, i) => i > change.range.endLineNumber - 1)
    ];

    this.files[filePath].contents = lines.join("\n");
  }
}
