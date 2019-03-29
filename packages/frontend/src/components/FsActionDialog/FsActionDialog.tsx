import * as React from "react";
import {connect} from "react-redux";
import {IState} from "../../store";
import {Alert} from "@blueprintjs/core";
import {useEffect, useState} from "react";
import {FSAction} from "../../types/fsactions";
import {CloseFsActionDialog} from "../../store/fsActionDialog";
import {SocketServer} from "../../utils/socket";
import {SocketMessages} from "../../types/communication";

interface IStateProps {
  action: FSAction | null;
}
interface IDispatchProps {
  onCancel: () => void;
  onApply: (action: FSAction) => void;
}
interface IOwnProps {}

export const FsActionDialogUI: React.FunctionComponent<IStateProps & IDispatchProps & IOwnProps> = props => {
  const [action, setAction] = useState<FSAction | null>(null);
  useEffect(() => setAction(props.action), [props.action]);

  return (
    <Alert
      isOpen={action !== null}
      cancelButtonText={'Cancel'}
      confirmButtonText={'Okay'}
      onCancel={() => props.onCancel()}
      onConfirm={() => action && props.onApply(action)}
    >
      { JSON.stringify(action) }
    </Alert>
  )
};

export const FsActionDialog = connect<IStateProps, IDispatchProps, IOwnProps, IState>((state, ownProps) => ({
  action: state.fsActionDialog.action || null
}), (dispatch, ownProps) => ({
  onCancel: () => dispatch(CloseFsActionDialog.create({})),
  onApply: (action) => {
    dispatch(CloseFsActionDialog.create({}));

    SocketServer.emit<SocketMessages.FileSystem.RequestFSAction>("@@FS/REQUEST", { action });
  }
}))(FsActionDialogUI);


