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
import {Tab} from "semantic-ui-react";
import {CodeEditor} from "../CodeEditor/CodeEditor";
import {IUserWithLocalData} from "../../store/users";

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
  activeFile: string;
  actingUser: IUserWithLocalData;
  otherUsers: IUserWithLocalData[];
}

let EditorContainerUI: React.FunctionComponent<IDispatchProps & IStateProps> = props => {
  useEffect(() => {
    props.registerMosaik();
    props.makeMosaikActive();
  }, []);

  return (
    <>
      <Tab
        menu={{ secondary: true, pointing: true }}
        panes={props.openedFiles.map(file => ({
          menuItem: file,
          render: () => null
        }))}
        onTabChange={(e, data) => props.openFile(props.openedFiles[data.activeIndex as number])}
        activeIndex={props.openedFiles.indexOf(props.activeFile)}
      />

      <CodeEditor
        openedFiles={props.openedFiles}
        activeFile={props.activeFile}
        actingUser={props.actingUser}
        otherUsers={props.otherUsers}
      />
    </>
  );
};

export const EditorContainer = connect<IStateProps, IDispatchProps, IOwnProps, IState>((state, ownProps) => {
  const mosaik = state.openFiles.mosaiks.find(mosaik => mosaik.id === ownProps.mosaikId);
  console.log(state.users.users);

  return {
    openedFiles: mosaik ? mosaik.files : [],
    activeFile: mosaik ? mosaik.activeFile : '',
    actingUser: state.users.users.find(u => !!u.isItMe)!,
    otherUsers: state.users.users.filter(u => !u.isItMe)
  };
}, (dispatch, ownProps) => ({
  registerMosaik: () => dispatch(AddEditorMosaik.create({ mosaik: ownProps.mosaikId })),
  deregisterMosaik: () => dispatch(RemoveEditorMosaik.create({ mosaik: ownProps.mosaikId })),
  makeMosaikActive: () => dispatch(SwitchActiveEditorMosaik.create({ mosaik: ownProps.mosaikId })),
  openFile: path => dispatch(OpenFile.create({ mosaik: ownProps.mosaikId, path: path })),
  closeFile: path => dispatch(CloseFile.create({ mosaik: ownProps.mosaikId, path: path }))
}))(EditorContainerUI);
