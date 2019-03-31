import {setWith, TypedAction, TypedReducer} from "redoodle";
import {ITerminal} from "../types/terminal";

export interface ITerminalState {
  terminals: ITerminal[],
  isTerminalManagerOpen: boolean;
}

export const NewTerminal = TypedAction.define("@@terminal/new")<{
  terminal: ITerminal
}>();

export const TerminateTerminal = TypedAction.define("@@terminal/terminate")<{
  terminalId: number
}>();

export const OpenTerminal = TypedAction.define("@@terminal/open")<{
  terminalId: number
}>();

export const CloseTerminal = TypedAction.define("@@terminal/close")<{
  terminalId: number
}>();

export const ReceiveTerminalOutput = TypedAction.define("@@terminal/out")<{
  terminalId: number;
  data: string;
}>();

export const OpenTerminalManager = TypedAction.define("@@terminal/open_manager")<{}>();

export const CloseTerminalManager = TypedAction.define("@@terminal/close_manager")<{}>();

const reducer = TypedReducer.builder<ITerminalState>()
  .withHandler(NewTerminal.TYPE, (state, { terminal }) => setWith(state, {
    terminals: [...state.terminals, terminal]
  }))
  .withHandler(TerminateTerminal.TYPE, (state, { terminalId }) => setWith(state, {
    terminals: state.terminals.filter(t => t.id !== terminalId)
  }))
  .withHandler(OpenTerminal.TYPE, (state, { terminalId }) => setWith(state, {
    terminals: state.terminals.map(t => t.id !== terminalId ? t : { ...t, isOpen: true })
  }))
  .withHandler(CloseTerminal.TYPE, (state, { terminalId }) => setWith(state, {
    terminals: state.terminals.map(t => t.id !== terminalId ? t : { ...t, isOpens: false })
  }))
  .withHandler(ReceiveTerminalOutput.TYPE, (state, { terminalId, data }) => {
    const terminal = state.terminals.find(t => t.id === terminalId)!;
    terminal.output += data;

    return setWith(state, {
      terminals: state.terminals.map(t => t.id !== terminalId ? t : terminal)
    });
  })
  .withHandler(OpenTerminalManager.TYPE, state => setWith(state, { isTerminalManagerOpen: true }))
  .withHandler(CloseTerminalManager.TYPE, state => setWith(state, { isTerminalManagerOpen: false }))
  .build();

export default reducer;