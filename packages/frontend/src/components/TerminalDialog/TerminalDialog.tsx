import * as React from "react";
import {ThemedContainer} from "../common/ThemedContainer";
import {Drawer, Button} from "@blueprintjs/core";
import {connect} from "react-redux";
import {IState} from "../../store";
import {ITerminal} from "../../types/terminal";
import {CloseTerminalManager} from "../../store/terminal";
import {SocketServer} from "../../utils/socket";
import {SocketMessages} from "../../types/communication";
import {Terminal} from "../Terminal/Terminal";
import {useState} from "react";

interface IStateProps {
  terminals: ITerminal[];
  isOpen: boolean;
}
interface IDispatchProps {
  onClose: () => void;
}

export const TerminalDialogUI: React.FunctionComponent<IStateProps & IDispatchProps> = props => {
  const [currentTerminal, setCurrentTerminal] = useState<number | null>(null);

  const newTerminal = () => {
    SocketServer.emit<SocketMessages.Terminal.NewTerminal>("@@TERMINAL/NEW", {
      path: 'root'
    });
  };

  const onSendData = (id: number, data: string) => {
    SocketServer.emit<SocketMessages.Terminal.SendInput>("@@TERMINAL/IN", { id, data });
  };

  return (
    <ThemedContainer
      render={(theme: string, className: string) =>
        <Drawer
          isOpen={props.isOpen}
          title={'Terminal Management'}
          onClose={props.onClose}
          canEscapeKeyClose={true}
          canOutsideClickClose={true}
          isCloseButtonShown={true}
          className={className}
        >
          <div style={{margin: '2em'}}>
            <Button onClick={newTerminal}>
              New terminal
            </Button>

            {
              props.terminals.map(terminal => (
                <Button onClick={() => setCurrentTerminal(terminal.id)}>
                  { terminal.description }
                </Button>
              ))
            }

            {
              currentTerminal !== null
                ? <Terminal key={currentTerminal} terminalId={currentTerminal} />
                : 'No open terminal'
            }
          </div>
        </Drawer>
      }/>
  );
};

export const TerminalDialog = connect<IStateProps, IDispatchProps, {}, IState>((state, ownProps) => ({
  terminals: state.terminal.terminals,
  isOpen: state.terminal.isTerminalManagerOpen
}), (dispatch, ownProps) => ({
  onClose: () => dispatch(CloseTerminalManager.create({}))
}))(TerminalDialogUI);
