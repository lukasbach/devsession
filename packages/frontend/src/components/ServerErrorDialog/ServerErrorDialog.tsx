import * as React from "react";
import {Alert, Dialog, Drawer, H4} from "@blueprintjs/core";
import {IErrorInformation} from "../../types/errorhandling";
import {connect} from "react-redux";
import {IState} from "../../store";
import {DismissServerError, DismissUserError, SetServerErrorDialogState} from "../../store/errorhandling";
import {ThemedContainer} from "../common/ThemedContainer";
import {CalloutBar} from "../common/CalloutBar/CalloutBar";

interface IStateProps {
  errors: IErrorInformation[];
  isOpen: boolean;
}

interface IDispatchProps {
  onClose: () => void;
  onDismiss: (errorId: string) => void;
}

const ServerErrorUI: React.FunctionComponent<IStateProps & IDispatchProps> = props => (
  !!props.isOpen
    ? (
      <ThemedContainer render={(theme: string, className: string) => (
        <Drawer
          isOpen={props.isOpen}
          className={className}
          title={'Server Errors'}
          onClose={props.onClose}
          canEscapeKeyClose={true}
          canOutsideClickClose={true}
          isCloseButtonShown={true}
        >
          {
            props.errors.map((err, i) => (
              <CalloutBar
                key={i}
                text={<div>
                  <H4>{err.title}</H4>
                  {(err.message || []).map((m, j) => <p key={j}>m</p>)}
                </div>}
                actions={[{
                  text: 'Dismiss',
                  icon: 'cross',
                  onClick: () => err.id && props.onDismiss(err.id)
                }]}
                isDark={theme === 'dark'}
              />
            ))
          }
        </Drawer>
      )} />
    ) : null
);

export const ServerErrorDialog = connect<IStateProps, IDispatchProps, {}, IState>((state, ownProps) => ({
  errors: state.errorHandling.serverErrors,
  isOpen: state.errorHandling.isServerErrorsDialogOpen
}), (dispatch, ownProps) => ({
  onClose: () => dispatch(SetServerErrorDialogState.create({ isOpen: false })),
  onDismiss: errorId => dispatch(DismissServerError.create({ errorId }))
}))(ServerErrorUI);
