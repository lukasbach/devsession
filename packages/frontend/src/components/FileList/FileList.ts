import {connect} from "react-redux";
import {IState} from "../../store";
import {FileListUI} from "./FileListUI";
import {CloseFile, OpenFile} from "../../store/openFiles";
import {IUserWithLocalData} from "../../types/users";

interface IOwnProps {
}
interface IDispatchProps {
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
}
interface IStateProps {
  watchedFiles: Array<{
    path: string;
    user: IUserWithLocalData;
  }>
}

export type FileListUIProps = IOwnProps & IDispatchProps & IStateProps;

export const FileList = connect<IStateProps, IDispatchProps, IOwnProps, IState>((state, ownProps) => ({
  watchedFiles: state.users.users
    .filter(u => u.position && u.position.path)
    .map(u => ({
      path: u.position.path!,
      user: u
    }))
}), (dispatch, ownProps) => ({
  openFile: path => dispatch(OpenFile.create({ path })),
  closeFile: path => dispatch(CloseFile.create({ path }))
}))(FileListUI);
