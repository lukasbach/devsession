import * as React from "react";
import {ThemedContainer} from "../common/ThemedContainer";
import {Drawer, Button, NonIdealState} from "@blueprintjs/core";
import {connect} from "react-redux";
import {IState} from "../../store";
import {ITerminal} from "../../types/terminal";
import {CloseTerminalManager} from "../../store/terminal";
import {SocketServer} from "../../utils/socket";
import {SocketMessages} from "../../types/communication";
import {Terminal} from "../Terminal/Terminal";
import {useState} from "react";
import {TabBar} from "../common/TabBar/TabBar";

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

  const onClose = (id: number) => {
    SocketServer.emit<SocketMessages.Terminal.KillTerminal>("@@TERMINAL/KILL", { id })
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
          <TabBar
            values={props.terminals.map(t => ({
              id: t.id,
              text: t.description,
              canClose: true
            }))}
            activeValue={currentTerminal}
            onChange={t => setCurrentTerminal(t as number)}
            onAdd={newTerminal}
            onClose={id => onClose(id as number)}
          />

          {
            currentTerminal !== null
              ? <Terminal key={currentTerminal} terminalId={currentTerminal} />
              : (
                  <NonIdealState
                    title={'No terminal open'}
                    icon={'console'}
                    description={`Select a running terminal from the tabbar above or create a new one.`}
                    action={(
                      <Button onClick={newTerminal}>
                        Create new terminal
                      </Button>
                    )}
                  />
                )
          }
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
