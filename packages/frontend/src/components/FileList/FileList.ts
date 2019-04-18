import {connect} from "react-redux";
import {IState} from "../../store";
import {FileListUI} from "./FileListUI";
import {CloseFile, OpenFile} from "../../store/openFiles";
import {IUserWithLocalData} from "@devsession/common/src/types/users";
import {IFileSystemPermissionData, IUserPermission} from "@devsession/common/src/types/permissions";
import {getPathPermissions} from "@devsession/common/src/utils/permissions";
import {getMe} from "../../store/filters";
import {requestPathPermission} from "../../utils/permissions";

interface IOwnProps {
  noContextMenu?: boolean;
  onSelect?: (paths: string[]) => void;
}
interface IDispatchProps {
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
}
interface IStateProps {
  watchedFiles: Array<{
    path: string;
    user: IUserWithLocalData;
  }>;
  getPathPermissions: (path: string) => IFileSystemPermissionData,
  requestPathPermission: (paths: string[], permissionData: IFileSystemPermissionData) => void
}

export type FileListUIProps = IOwnProps & IDispatchProps & IStateProps;

export const FileList = connect<IStateProps, IDispatchProps, IOwnProps, IState>((state, ownProps) => ({
  watchedFiles: state.users.users
    .filter(u => u.position && u.position.path)
    .map(u => ({
      path: u.position.path!,
      user: u
    })),
  getPathPermissions: (path) => getPathPermissions(path, getMe(state), state.permissions.permissions),
  requestPathPermission: (paths, permissionData) => requestPathPermission(paths, getMe(state).id, permissionData)
}), (dispatch, ownProps) => ({
  openFile: path => dispatch(OpenFile.create({ path })),
  closeFile: path => dispatch(CloseFile.create({ path }))
}))(FileListUI);
