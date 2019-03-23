import {connect} from "react-redux";
import {IState} from "../../store";
import {FileListUI} from "./FileListUI";
import {CloseFile, OpenFile} from "../../store/openFiles/reducer";

interface IOwnProps {
}
interface IDispatchProps {
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
}
interface IStateProps {
}

export type FileListUIProps = IOwnProps & IDispatchProps & IStateProps;

export const FileList = connect<IStateProps, IDispatchProps, IOwnProps, IState>((state, ownProps) => ({

}), (dispatch, ownProps) => ({
  openFile: path => dispatch(OpenFile.create({ path })),
  closeFile: path => dispatch(CloseFile.create({ path }))
}))(FileListUI);
