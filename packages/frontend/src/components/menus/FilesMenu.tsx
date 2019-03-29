import * as React from "react";
import {H4, Menu, MenuDivider, MenuItem, Tag} from "@blueprintjs/core";
import {IFileSystemPermissionData} from "../../types/permissions";
import {getPermissionTextForFiles} from "../../utils/permissions";
import {IUserWithLocalData} from "../../types/users";

export const FilesMenu: React.FunctionComponent<{
  permissions: IFileSystemPermissionData;
  requestPathPermission: (paths: string[], permissionData: IFileSystemPermissionData) => void;
  paths: string[];
}> = props => {
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
      <MenuItem text={'Request read permissions'} onClick={() => props.requestPathPermission(props.paths, {mayRead: true, mayWrite: false, mayDelete: false})} />
      <MenuItem text={'Request write permissions'} onClick={() => props.requestPathPermission(props.paths, {mayRead: false, mayWrite: true, mayDelete: false})} />
      <MenuItem text={'Request delete permissions'} onClick={() => props.requestPathPermission(props.paths, {mayRead: false, mayWrite: false, mayDelete: true})} />
    </Menu>
  );
}