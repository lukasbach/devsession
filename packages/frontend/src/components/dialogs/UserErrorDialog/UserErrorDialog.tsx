import * as React from "react";
import {Alert} from "@blueprintjs/core";
import {IErrorInformation} from "@devsession/common/src/types/errorhandling";
import {connect} from "react-redux";
import {IState} from "../../../store";
import {DismissUserError} from "../../../store/errorhandling";
import {ThemedContainer} from "../../common/ThemedContainer";

interface IStateProps {
  error: IErrorInformation | undefined;
}

interface IDispatchProps {
  onClose: () => void;
}

const UserErrorDialogUI: React.FunctionComponent<IStateProps & IDispatchProps> = props => (
  !!props.error
    ? (
      <ThemedContainer render={(theme: string, className: string) => (
        <Alert
          className={className}
          isOpen={!!props.error}
          intent={"danger"}
          icon={"warning-sign"}
          confirmButtonText={'Dismiss'}
          onClose={props.onClose}
        >
          <p>{props.error!.title}</p>

          {props.error!.message && props.error!.message!.map(m => <p key={m}>{m}</p>)}
        </Alert>
      )} />
    ) : null
);

export const UserErrorDialog = connect<IStateProps, IDispatchProps, {}, IState>((state, ownProps) => ({
  error: state.errorHandling.userError
}), (dispatch, ownProps) => ({
  onClose: () => dispatch(DismissUserError.create({}))
}))(UserErrorDialogUI);
