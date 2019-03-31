import * as React from "react";
import {ITerminal} from "../../types/terminal";
import {useEffect, useRef} from "react";
import * as xterm from "xterm";
import {SocketServer} from "../../utils/socket";
import {SocketMessages} from "../../types/communication";
import {connect} from "react-redux";
import {IState} from "../../store";
import {CloseTerminal, OpenTerminal} from "../../store/terminal";

import "xterm/dist/xterm.css";
import {NonIdealState} from "@blueprintjs/core";

interface IStateProps {
  terminal: ITerminal;
}
interface IDispatchProps {
  onOpenTerminal: () => void;
  onCloseTerminal: () => void;
  onInputData: (data: string) => void;
}
interface IOwnProps {
  terminalId: number;
}

export const TerminalUI: React.FunctionComponent<IStateProps & IDispatchProps & IOwnProps> = props => {
  if (!props.terminal) {
    return (
      <NonIdealState title={'Terminal closed'} icon={'console'}/>
    );
  }

  const { id } = props.terminal;

  const terminalDomElement = useRef(null);
  const XTerminal = useRef<xterm.Terminal>();

  useEffect(() => {
    props.onOpenTerminal();

    XTerminal.current = new xterm.Terminal();
    XTerminal.current.open(terminalDomElement.current!);
    XTerminal.current.focus();

    XTerminal.current.on('resize', size => console.log("On size change", size));
    XTerminal.current.on('data', props.onInputData);

    SocketServer.on<SocketMessages.Terminal.NotifyOutput>("@@TERMINAL/OUT", payload => {
      if (payload.id === id) {
        console.log("Received matching data from server:", payload.data);
        XTerminal.current!.write(payload.data);
      } else {
        console.log("Received non matching data from server:", payload.data);
      }
    });

    return () => props.onCloseTerminal();
  }, []);


  return <div ref={terminalDomElement} />;
};

export const Terminal = connect<IStateProps, IDispatchProps, IOwnProps, IState>((state, ownProps) => {
  return {
    terminal: state.terminal.terminals.find(t => t.id === ownProps.terminalId)!
  };
}, (dispatch, ownProps) => ({
  onOpenTerminal: () => {
    SocketServer.emit<SocketMessages.Terminal.OpenTerminal>("@@TERMINAL/OPEN", { id: ownProps.terminalId});
    dispatch(OpenTerminal.create({ terminalId: ownProps.terminalId }))
  },
  onCloseTerminal: () => {
    SocketServer.emit<SocketMessages.Terminal.CloseTerminal>("@@TERMINAL/CLOSE", { id: ownProps.terminalId});
    dispatch(CloseTerminal.create({ terminalId: ownProps.terminalId }))
  },
  onInputData: (data: string) => {
    console.log('On data input', data);
    SocketServer.emit<SocketMessages.Terminal.SendInput>("@@TERMINAL/IN", { id: ownProps.terminalId, data });
  }
}))(TerminalUI);
