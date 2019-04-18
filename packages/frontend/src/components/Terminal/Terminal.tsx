import * as React from "react";
import {ITerminal} from "@devsession/common/src/types/terminal";
import {useEffect, useRef} from "react";
import * as xterm from "xterm";
import * as fit from 'xterm/lib/addons/fit/fit';
import {SocketMessages} from "@devsession/common/src/types/communication";
import {connect} from "react-redux";
import {IState} from "../../store";
import {CloseTerminal, OpenTerminal} from "../../store/terminal";
import {Colors, NonIdealState, ResizeSensor} from "@blueprintjs/core";
import {SocketServer} from "../../services/SocketServer";

import "xterm/dist/xterm.css";

xterm.Terminal.applyAddon(fit);

interface IStateProps {
  terminal: ITerminal;
  theme: 'dark' | 'light';
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

  const bgColor = Colors.DARK_GRAY1; // props.theme === "dark" ? Colors.DARK_GRAY1 : Colors.LIGHT_GRAY1;

  const terminalDomElement = useRef(null);
  const XTerminal = useRef<xterm.Terminal>();

  useEffect(() => {
    props.onOpenTerminal();

    XTerminal.current = new xterm.Terminal();
    XTerminal.current.open(terminalDomElement.current!);
    XTerminal.current.focus();
    (XTerminal.current as any).fit();

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

  useEffect(() => {
    if (XTerminal.current) {
      XTerminal.current.setOption('theme', {
        background: bgColor
      });
    }
  }, [props.theme]);

  return (
    <ResizeSensor
      onResize={() => {
        if (XTerminal.current) {
          (XTerminal.current as any).fit();
        }
      }}
    >
      <div ref={terminalDomElement} style={{ flexGrow: 1, backgroundColor: bgColor }} />
    </ResizeSensor>
  );
};

export const Terminal = connect<IStateProps, IDispatchProps, IOwnProps, IState>((state, ownProps) => {
  return {
    terminal: state.terminal.terminals.find(t => t.id === ownProps.terminalId)!,
    theme: state.settings.app.applicationTheme
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
