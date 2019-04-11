import * as React from "react";
import {connect} from "react-redux";
import {IState} from "../../../store";
import {
  AddEditorMosaik,
  CloseFile,
  OpenFile,
  RemoveEditorMosaik,
  SwitchActiveEditorMosaik
} from "../../../store/openFiles";
import {useEffect} from "react";
import {EditorTabs} from "./EditorTabs";
import {Button, NonIdealState} from "@blueprintjs/core";
import {IUserWithLocalData} from "../../../types/users";
import {IFileSystemPermissionData} from "../../../types/permissions";
import {getPathPermissions, requestPathPermission} from "../../../utils/permissions";
import {getMe} from "../../../store/filters";
import {PermissionCheckedCodeEditor} from "../CodeEditor/PermissionCheckedCodeEditor";

interface IOwnProps {
  mosaikId: string;
}
interface IDispatchProps {
  registerMosaik: () => void;
  deregisterMosaik: () => void;
  makeMosaikActive: () => void;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
}
interface IStateProps {
  openedFiles: string[];
  activeFile?: string;
  actingUser: IUserWithLocalData;
  otherUsers: IUserWithLocalData[];
  theme: string;
  appTheme: 'dark' | 'light';
  mosaikId: string;
  permissionData: IFileSystemPermissionData;
}

let EditorContainerUI: React.FunctionComponent<IDispatchProps & IStateProps> = props => {
  useEffect(() => {
    props.registerMosaik();
    props.makeMosaikActive();
  }, []);

  useEffect(() => {
    props.deregisterMosaik();
    props.registerMosaik();
    props.makeMosaikActive();
  }, [props.mosaikId]);


  return (
    <>
      <EditorTabs
        openedFiles={props.openedFiles}
        activeFile={props.activeFile}
        onCloseFile={props.closeFile}
        onChangeFile={props.openFile}
      />

      <PermissionCheckedCodeEditor editorProps={{
        openedFiles: props.openedFiles,
        activeFile: props.activeFile!, // TODO
        actingUser: props.actingUser,
        otherUsers: props.otherUsers,
        theme: props.theme,
        appTheme: props.appTheme,
        permissionData: props.permissionData
      }}/>
    </>
  );
};

export const EditorContainer = connect<IStateProps, IDispatchProps, IOwnProps, IState>((state, ownProps) => {
  const mosaik = state.openFiles.mosaiks.find(mosaik => mosaik.id === ownProps.mosaikId);

  return {
    openedFiles: mosaik ? mosaik.files : [],
    activeFile: mosaik ? mosaik.activeFile : '',
    actingUser: state.users.users.find(u => !!u.isItMe)!,
    otherUsers: state.users.users.filter(u => !u.isItMe),
    theme: state.settings.app.monacoTheme,
    appTheme: state.settings.app.applicationTheme,
    mosaikId: ownProps.mosaikId,
    permissionData: !(mosaik && mosaik!.activeFile)
      ? { mayRead: true, mayWrite: true, mayDelete: true }
      : getPathPermissions(mosaik!.activeFile!, getMe(state), state.permissions.permissions)
  };
}, (dispatch, ownProps) => ({
  registerMosaik: () => dispatch(AddEditorMosaik.create({ mosaik: ownProps.mosaikId })),
  deregisterMosaik: () => dispatch(RemoveEditorMosaik.create({ mosaik: ownProps.mosaikId })),
  makeMosaikActive: () => dispatch(SwitchActiveEditorMosaik.create({ mosaik: ownProps.mosaikId })),
  openFile: path => dispatch(OpenFile.create({ mosaik: ownProps.mosaikId, path: path })),
  closeFile: path => dispatch(CloseFile.create({ mosaik: ownProps.mosaikId, path: path }))
}))(EditorContainerUI);
