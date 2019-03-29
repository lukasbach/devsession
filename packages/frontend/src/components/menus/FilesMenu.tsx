import * as React from "react";
import {H4, Menu, MenuDivider, MenuItem, Tag} from "@blueprintjs/core";
import {IFileSystemPermissionData} from "../../types/permissions";
import {
  getPathPermissions,
  getPermissionTextForFiles, isFsActionAllowed,
  mergePathPermissions,
  requestPathPermission
} from "../../utils/permissions";
import {IUserWithLocalData} from "../../types/users";
import {connect} from "react-redux";
import {IState} from "../../store";
import {getMe} from "../../store/filters";
import {CloseFile, OpenFile} from "../../store/openFiles";
import {FileListUI} from "../FileList/FileListUI";
import {SocketServer} from "../../utils/socket";
import {SocketMessages} from "../../types/communication";

interface IStateProps {
  permissions: IFileSystemPermissionData;
  requestPathPermission: (paths: string[], permissionData: IFileSystemPermissionData) => void;
  canCreateFile: boolean;
  canCreateFolder: boolean;
  canRenameFiles: boolean;
  canDeleteFiles: boolean;
  canMoveFiles: boolean;
}
interface IDispatchProps {
}
interface IOwnProps {
  paths: string[];
}

export const FilesMenuUI: React.FunctionComponent<IStateProps & IDispatchProps & IOwnProps> = props => {
  let title;
  const permissionsDescription = getPermissionTextForFiles(props.permissions, props.paths.length !== 1);

  switch (props.paths.length) {
    case 0:
      title = 'No files selected';
      break;
    case 1:
      title = props.paths[0];
      break;
    default:
      title = `${props.paths.length} items selected`;
      break;
  }

  const createFile = (extension: string) => {
    if (props.paths.length !== 1) return;

    SocketServer.emit<SocketMessages.FileSystem.RequestFSAction>("@@FS/REQUEST", {
      action: {
        type: "create",
        path: props.paths[0],
        filename: extension === '' ? 'New directory' : `New File${extension}`,
        isDir: extension === ''
      }
    });
  };

  const deleteFile = () => {
    if (props.paths.length === 0) return;

    props.paths.forEach(path => {
      SocketServer.emit<SocketMessages.FileSystem.RequestFSAction>("@@FS/REQUEST", {
        action: { type: "delete", path }
      });
    })
  };

  return (
    <Menu>
      <MenuDivider title={(
        <>
          <H4>{ title }</H4>
          <p>{ permissionsDescription }<br /><br />
            <Tag large round fill icon={'eye-open'} rightIcon={props.permissions.mayRead ? 'tick' : 'cross'} intent={props.permissions.mayRead ? "success" : "warning"}>Read permission</Tag><br />
            <Tag large round fill icon={'edit'} rightIcon={props.permissions.mayWrite ? 'tick' : 'cross'} intent={props.permissions.mayWrite ? "success" : "warning"}>Write permission</Tag><br />
            <Tag large round fill icon={'trash'} rightIcon={props.permissions.mayDelete ? 'tick' : 'cross'} intent={props.permissions.mayDelete ? "success" : "warning"}>Delete permission</Tag>
          </p>
        </>
      )} />

      <MenuDivider />

      {
        !props.permissions.mayRead &&
        <MenuItem text={'Request read permissions'} onClick={() => props.requestPathPermission(props.paths, {mayRead: true, mayWrite: false, mayDelete: false})} />
      }

      {
        !props.permissions.mayWrite &&
        <MenuItem text={'Request write permissions'} onClick={() => props.requestPathPermission(props.paths, {mayRead: false, mayWrite: true, mayDelete: false})} />
      }

      {
        !props.permissions.mayDelete &&
        <MenuItem text={'Request delete permissions'} onClick={() => props.requestPathPermission(props.paths, {mayRead: false, mayWrite: false, mayDelete: true})} />
      }

      {
        (!props.permissions.mayRead || !props.permissions.mayWrite || !props.permissions.mayDelete) &&
        <MenuDivider/>
      }

      {
        props.canCreateFile &&
        <MenuItem icon={"document-open"} text={'Create file...'}>
          <MenuItem text={'Text file'} onClick={() => createFile('.txt')} />
          <MenuItem text={'TypeScript file'} onClick={() => createFile('.ts')} />
          <MenuItem text={'JavaScript file'} onClick={() => createFile('.js')} />
          <MenuItem text={'Markdown file'} onClick={() => createFile('.md')} />
        </MenuItem>
      }

      {
        props.canCreateFolder &&
        <MenuItem icon={"folder-new"} text={'Create folder'} onClick={() => createFile('')} />
      }

      {
        props.canDeleteFiles &&
        <MenuItem icon={"trash"} text={'Delete'} onClick={() => deleteFile()} />
      }
    </Menu>
  );
};

export const FilesMenu = connect<IStateProps, IDispatchProps, IOwnProps, IState>((state, ownProps) => ({
  requestPathPermission: (paths, permissionData) => requestPathPermission(paths, getMe(state).id, permissionData),
  permissions: mergePathPermissions(...ownProps.paths.map(p => getPathPermissions(p, getMe(state), state.permissions.permissions))),
  canCreateFile:   ownProps.paths.length === 1 && isFsActionAllowed({ type: "create", path: ownProps.paths[0], filename: '_', isDir: false }, state.permissions.permissions, getMe(state)),
  canCreateFolder: ownProps.paths.length === 1 && isFsActionAllowed({ type: "create", path: ownProps.paths[0], filename: '_', isDir: false }, state.permissions.permissions, getMe(state)),
  canRenameFiles: ownProps.paths.length === 1 && isFsActionAllowed({ type: "rename", pathFrom: ownProps.paths[0], pathTo: ownProps.paths[0] + '_'}, state.permissions.permissions, getMe(state)),
  canDeleteFiles: ownProps.paths.length > 0 && isFsActionAllowed({ type: "delete", path: ownProps.paths[0] }, state.permissions.permissions, getMe(state)),
  canMoveFiles: false
}), (dispatch, ownProps) => ({
}))(FilesMenuUI);


