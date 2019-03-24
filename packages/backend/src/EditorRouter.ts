import * as fs from "fs";
import * as path from "path";
import {Server, Socket} from "socket.io";
import {SocketMessages} from "../../frontend/src/types/communication";
import {IChange} from "../../frontend/src/types/editor";
import {AbstractRouter} from "./AbstractRouter";

const projectPath = "../../demodirectory";

export default class EditorRouter extends AbstractRouter {
  public readonly routerPrefix = "editor";

  private files: {
    [path: string]: { contents: string, openedByUsers: string[] }
  } = {};

  public onNewSocket(socket: Socket, server: Server): void {
    this.onSocketMessage<SocketMessages.Editor.OpenedFile>(socket, "@@EDITOR/OPEN_FILE", (payload) => {
      const filePath = path.normalize(path.join(projectPath, payload.path));

      if (!this.isAccessAllowed(filePath)) {
        return;
      }

      if (this.isOpened(filePath)) {
        this.files[filePath].openedByUsers.push(payload.user);
      } else {
        fs.readFile(filePath, (err, data) => {
          if (err) {
            console.error(err);
          } else {
            this.files[filePath] = {
              contents: data.toString("utf8"),
              openedByUsers: [payload.user]
            };
          }
        });
      }
    });

    this.onSocketMessage<SocketMessages.Editor.ClosedFile>(socket, "@@EDITOR/CLOSE_FILE", (payload) => {
      const filePath = path.normalize(path.join(projectPath, payload.path));

      if (this.isOpened(filePath)) {
        this.files[filePath].openedByUsers = this.files[filePath].openedByUsers.filter((user) => user !== payload.user);
        if (this.files[filePath].openedByUsers.length === 0) {
          if (this.isAccessAllowed(filePath)) {
            fs.writeFile(filePath, this.files[filePath].contents, (err) => {
              if (err) {
                console.error(err);
              }
            });
          }
          this.files[filePath] = undefined;
        }
      }
    });

    this.onSocketMessage<SocketMessages.Editor.ChangedText>(socket, "@@EDITOR/CHANGED_TEXT", (payload, msg) => {
      const filePath = path.normalize(path.join(projectPath, payload.path));

      if (!this.isAccessAllowed(filePath)) {
        return;
      }

      if (!this.isOpened(filePath)) {
        return console.error(`Accessing ${filePath} even though it is not opened.`);
      }

      payload.changes.forEach((change) => this.applyChange(filePath, change));

      this.forward(socket, msg.message, msg.payload);
    });
  }

  public defineRoutes(): void {
    this.router.get("/dir", ((req, res) => {
      const requestedPath = req.query.path || ".";

      fs.readdir(path.join(projectPath, requestedPath), (err, files) => {
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
      const requestedPath = req.query.path || ".";

      fs.readFile(path.join(projectPath, requestedPath), { encoding: "utf8" }, (err, file) => {
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
