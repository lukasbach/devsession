import * as pty from "node-pty";
import * as path from "path";
import {getActualPathFromNormalizedPath} from "../../frontend/src/utils/projectpath";
import {projectPath} from "./EditorRouter";

const CMD = process.platform === "win32" ? "cmd.exe" : "bash";

export interface ITerminalData {
  id: number;
  path: string;
  description: string;
  process: pty.IPty;
  storedOutput: string;
}

export class TerminalService {
  private terminals: ITerminalData[] = [];

  private terminalCounter = 0;

  public createTerminal(spawnPath: string, description?: string): ITerminalData {
    const actualPath = path.join(projectPath, getActualPathFromNormalizedPath(spawnPath));

    const process = pty.spawn(CMD, [], {
      cols: 80,
      rows: 30,
      cwd: actualPath,
      env: {}
    });

    const terminal = {
      id: this.terminalCounter++,
      description: description || `Terminal ${this.terminalCounter - 1}`,
      path: spawnPath,
      storedOutput: "",
      process,
    };

    this.terminals.push(terminal);
    return terminal;
  }

  public getTerminal(id: number): ITerminalData | undefined {
    return this.terminals.find((t) => t.id === id);
  }

  public getAllTerminals(): ITerminalData[] {
    return this.terminals;
  }

  public terminateTerminal(id: number) {
    const terminal = this.terminals.find((t) => t.id === id);

    if (terminal) {
      terminal.process.kill();
      this.terminals = this.terminals.filter((t) => t.id !== id);
    }
  }
}
