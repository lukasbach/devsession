import * as xterm from "xterm";
import {ITerminal} from "../types/terminal";
import {SocketServer} from "../utils/socket";
import {SocketMessages} from "../types/communication";
import {Dispatch} from "redux";
import {IState} from "../store";
/*
export default class TerminalService {
  private static instance: TerminalService = new TerminalService();
  private terminals: Array<{
    id: number;
    terminalData: ITerminal;
    terminal: xterm.Terminal;
  }>;
  private dispatch: Dispatch<any>;

  private constructor(dispatch: Dispatch<any>) {
    this.terminals = [];
    this.dispatch = dispatch;

    this.setupSocketConnections();
  }

  public static initiate(dispatch: Dispatch<any>) {
    this.instance = new TerminalService(dispatch;
  }

  public static getInstance() {
    if (!this.instance) {
    }
    return this.instance;
  }

  // noinspection JSMethodCanBeStatic
  public initiateNewTerminal() {
    SocketServer.emit<SocketMessages.Terminal.NewTerminal>("@@TERMINAL/NEW", {
      path: 'root'
    });
  }

  public openTerminal() {

  }

  public closeTerminal() {

  }

  public killTerminal() {

  }

  public onServerEmitsNewTerminal() {

  }

  private setupSocketConnections() {
    SocketServer.on<SocketMessages.Terminal.NotifyOutput>("@@TERMINAL/OUT", payload => {
      const terminal = this.terminals.find(t => t.id === payload.id);

      if (terminal) {
        console.log("Received matching data from server:", payload.data);
        terminal.terminal.write(payload.data);
      }
    });
  }

}
*/
