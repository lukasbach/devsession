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
import {IUserWithLocalData} from "../../store/users";
import {EditorTabs} from "./EditorTabs";
import {NonIdealState} from "@blueprintjs/core";

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
}

let EditorContainerUI: React.FunctionComponent<IDispatchProps & IStateProps> = props => {
  useEffect(() => {
    props.registerMosaik();
    props.makeMosaikActive();
  }, []);

  return (
    <>
    {/*<Tab
        menu={{ secondary: true, pointing: true }}
        panes={props.openedFiles.map(file => ({
          menuItem: file,
          render: () => null
        }))}
        onTabChange={(e, data) => props.openFile(props.openedFiles[data.activeIndex as number])}
        activeIndex={props.openedFiles.indexOf(props.activeFile)}
      />*/}
      <EditorTabs
        openedFiles={props.openedFiles}
        activeFile={props.activeFile}
        onCloseFile={props.closeFile}
        onChangeFile={props.openFile}
      />

      {
        props.activeFile
          ? (
            <CodeEditor
              openedFiles={props.openedFiles}
              activeFile={props.activeFile}
              actingUser={props.actingUser}
              otherUsers={props.otherUsers}
              theme={props.theme}
            />
          )
          : (
            <NonIdealState
              icon={'warning-sign'}
              title={'No file open'}
              description={'Open a file from the list on the left to start coding.'}
            />
          )
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
    theme: state.settings.app.monacoTheme
  };
}, (dispatch, ownProps) => ({
  registerMosaik: () => dispatch(AddEditorMosaik.create({ mosaik: ownProps.mosaikId })),
  deregisterMosaik: () => dispatch(RemoveEditorMosaik.create({ mosaik: ownProps.mosaikId })),
  makeMosaikActive: () => dispatch(SwitchActiveEditorMosaik.create({ mosaik: ownProps.mosaikId })),
  openFile: path => dispatch(OpenFile.create({ mosaik: ownProps.mosaikId, path: path })),
  closeFile: path => dispatch(CloseFile.create({ mosaik: ownProps.mosaikId, path: path }))
}))(EditorContainerUI);
