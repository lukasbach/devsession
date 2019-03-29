import {Button, Drawer, HTMLTable, Tag} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import {IState} from "../../store";
import {IUser, IUserWithLocalData} from "../../types/users";
import {IPermissionsState, SetPermissionManagerState} from "../../store/permissions";
import {UserSelection} from "../common/UserSelection";
import {ThemedContainer} from "../common/ThemedContainer";
import {useState} from "react";
import {IFileSystemPermission, IUserPermission} from "../../types/permissions";
import {SocketServer} from "../../utils/socket";
import {SocketMessages} from "../../types/communication";

interface IStateProps {
  isOpen: boolean;
  currentUser: IUser | undefined;
  userPermissions: IUserPermission[];
}
interface IDispatchProps {
  close: () => void;
  setCurrentUser: (userId: string) => void;
}

export const PermissionManagementDialogUI: React.FunctionComponent<IStateProps & IDispatchProps> = props => {
  const revokePermission = (permissionId: number) => SocketServer.emit<SocketMessages.Permissions.RevokeExistingPermission>(
    "@@PERM/REVOKE",
    { permissionIds: [permissionId] }
  );

  return (
    <ThemedContainer
      render={(theme: string, className: string) =>
        <Drawer
          isOpen={props.isOpen}
          title={'Permission Management'}
          onClose={props.close}
          canEscapeKeyClose={true}
          canOutsideClickClose={true}
          isCloseButtonShown={true}
          className={className}
        >
          <div style={{ margin: '2em' }}>
            <UserSelection onSelect={(user: IUserWithLocalData) => props.setCurrentUser(user.id)} /> &nbsp;Select a user to view or change his/her permissions.

            {
              props.currentUser &&
              <Button minimal onClick={() => {
                SocketServer.emit<SocketMessages.Permissions.CreatePermission>("@@PERM/CREATE", {
                  permissions: [{
                    permissionId: -1,
                    type: "fs",
                    path: "",
                    mayRead: true,
                    mayWrite: true,
                    mayDelete: true,
                    userid: props.currentUser!.id
                  } as IFileSystemPermission]
                })
              }}>
                  Grant full permissions for everything
              </Button>
            }

            <HTMLTable>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Permission</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {
                  props.userPermissions
                    .filter(perm => perm.type === "fs")
                    .map(perm => perm as IFileSystemPermission)
                    .map(perm => (
                    <tr>
                      <td>{perm.permissionId}</td>
                      <td>
                        FS permissions on path {perm.path}:
                        <Tag icon={"eye-on"} rightIcon={perm.mayRead   ? 'tick' : 'cross'} intent={perm.mayRead   ? "success" : "warning"} />
                        <Tag icon={"edit"}   rightIcon={perm.mayWrite  ? 'tick' : 'cross'} intent={perm.mayWrite  ? "success" : "warning"} />
                        <Tag icon={"trash"}  rightIcon={perm.mayDelete ? 'tick' : 'cross'} intent={perm.mayDelete ? "success" : "warning"} />
                      </td>
                      <td>
                        <Button minimal onClick={() => revokePermission(perm.permissionId)}>
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </HTMLTable>
          </div>
        </Drawer>
      }
    />
  )
};

export const PermissionManagementDialog = connect<IStateProps, IDispatchProps, {}, IState>((state, ownProps) => ({
  isOpen: state.permissions.permissionManager.open,
  currentUser: state.permissions.permissionManager.currentUser
    ? state.users.users.find(u => u.id === state.permissions.permissionManager.currentUser)! : undefined,
  userPermissions: state.permissions.permissions.filter(u => u.userid === state.permissions.permissionManager.currentUser)
}), (dispatch, ownProps) => ({
  close: () => dispatch(SetPermissionManagerState.create({ open: false, currentUser: undefined })),
  setCurrentUser: currentUser => dispatch(SetPermissionManagerState.create({ open: true, currentUser }))
}))(PermissionManagementDialogUI);
