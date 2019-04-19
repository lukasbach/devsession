import * as React from "react";
import {connect} from "react-redux";
import {IState} from "../../../store";
import {Alert, Button, Callout, Classes, Dialog, Drawer} from "@blueprintjs/core";
import {useEffect, useState} from "react";
import {FSAction} from "@devsession/common";
import {CloseFsActionDialog} from "../../../store/fsActionDialog";
import {SocketMessages} from "@devsession/common";
import {
  FsActionFormCreateFile,
  FsActionFormCreateFolder,
  FsActionFormDelete,
  FsActionFormRename
} from "./fsActionForms";
import {ThemedContainer} from "../../common/ThemedContainer";
import {SocketServer} from "../../../services/SocketServer";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setAction(props.action), [props.action]);
  useEffect(() => setError(null), [(props.action ? props.action.type : null)]);

  return (
    <ThemedContainer
      render={(theme: string, className: string) => (
        <Dialog
          className={className}
          isOpen={action !== null}
          title={'Filesystem operation'}
          icon={"folder-open"}
          onClose={() => props.onCancel()}
          canOutsideClickClose={true}
          canEscapeKeyClose={true}
        >
          <div className={Classes.DIALOG_BODY}>
            { error && <Callout intent={"warning"} icon={"warning-sign"}>{error}</Callout> }

            {
              action && (
                action.type === "create"
                  ? (
                    action.isDir
                      ? <FsActionFormCreateFolder action={action} onChange={setAction} onError={setError} />
                      : <FsActionFormCreateFile action={action} onChange={setAction} onError={setError} />
                  )
                  : action.type === "rename"
                  ? <FsActionFormRename action={action} onChange={setAction} onError={setError} />
                  : action.type === "copy"
                    ? null
                    : action.type === "delete"
                      ? <FsActionFormDelete action={action} onChange={setAction} onError={setError} />
                      : null
              )
            }
          </div>

          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button onClick={() => props.onCancel()}>Cancel</Button>
              <Button
                disabled={!!error}
                onClick={() => action && props.onApply(action)}
                intent={(action && action!.type === "delete") ? "danger" : "primary"}
              >
                Okay
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    />
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


