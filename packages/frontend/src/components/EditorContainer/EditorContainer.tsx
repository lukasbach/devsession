import * as React from "react";
import {connect} from "react-redux";
import {IState} from "../../store";
import {
  AddEditorMosaik,
  CloseFile,
  OpenFile,
  RemoveEditorMosaik,
  SwitchActiveEditorMosaik
} from "../../store/openFiles";
import {useEffect} from "react";
import {CodeEditor} from "../CodeEditor/CodeEditor";
import {EditorTabs} from "./EditorTabs";
import {Button, NonIdealState} from "@blueprintjs/core";
import {IUserWithLocalData} from "../../types/users";
import {IFileSystemPermissionData} from "../../types/permissions";
import {getPathPermissions, requestPathPermission} from "../../utils/permissions";
import {getMe} from "../../store/filters";

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


  const noReadPermissionError = (activeFile: string) => (
    <NonIdealState
      icon={'warning-sign'}
      title={'No read permission'}
      description={'You do not have the required permissions to view this file. You can request permissions for this ' +
        'specific file with the buttons below, or you can request permissions for an entire folder in the filelist ' +
        'on the left by right-clicking an item and requesting permissions from there.'}
      action={(
        <>
          <Button icon={'eye-open'} onClick={() => {
            requestPathPermission(activeFile, props.actingUser.id, { mayRead: true, mayWrite: false, mayDelete: false })
          }}>
            Request read permission
          </Button>
          <Button icon={'edit'} onClick={() => {
            requestPathPermission(activeFile, props.actingUser.id, { mayRead: true, mayWrite: true, mayDelete: false })
          }}>
            Request read and write permission
          </Button>
        </>
      )}
    />
  );

  const noOpenFileError = (
    <NonIdealState
      icon={'warning-sign'}
      title={'No file open'}
      description={'Open a file from the list on the left to start coding.'}
    />
  );

  const editor = (activeFile: string) => (
    <CodeEditor
      openedFiles={props.openedFiles}
      activeFile={activeFile}
      actingUser={props.actingUser}
      otherUsers={props.otherUsers}
      theme={props.theme}
      appTheme={props.appTheme}
      permissionData={props.permissionData}
    />
  );

  return (
    <>
      <EditorTabs
        openedFiles={props.openedFiles}
        activeFile={props.activeFile}
        onCloseFile={props.closeFile}
        onChangeFile={props.openFile}
      />

      {
        props.activeFile ? (!props.permissionData.mayRead ? noReadPermissionError(props.activeFile) : editor(props.activeFile)) : noOpenFileError
      }
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
