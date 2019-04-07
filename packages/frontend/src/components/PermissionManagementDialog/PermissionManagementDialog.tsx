import {Button, Drawer, HTMLTable, IconName, Tag} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import {IState} from "../../store";
import {IUser, IUserWithLocalData} from "../../types/users";
import {IPermissionsState, OpenPermissionApplicationDialog, SetPermissionManagerState} from "../../store/permissions";
import {UserSelection} from "../common/UserSelection";
import {ThemedContainer} from "../common/ThemedContainer";
import {useState} from "react";
import {IFileSystemPermission, IUserPermission} from "../../types/permissions";
import {SocketServer} from "../../utils/socket";
import {SocketMessages} from "../../types/communication";
import {CalloutBar} from "../common/CalloutBar/CalloutBar";
import {PermissionBar} from "../common/PermissionBar/PermissionBar";

interface IStateProps {
  isOpen: boolean;
  currentUser: IUserWithLocalData | undefined;
  userPermissions: IUserPermission[];
}
interface IDispatchProps {
  close: () => void;
  setCurrentUser: (userId: string) => void;
  openPermissionDialog: (user: IUserWithLocalData) => void;
}


export const PermissionManagementDialogUI: React.FunctionComponent<IStateProps & IDispatchProps> = props => {
  const revokePermission = (permissionId: number) => SocketServer.emit<SocketMessages.Permissions.RevokeExistingPermission>(
    "@@PERM/REVOKE",
    { permissionIds: [permissionId] }
  );

  const actions = (permId: number) => [{
    text: 'Revoke',
    onClick: () => revokePermission(permId)
  }];

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
                    path: "root",
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

            {
              props.currentUser &&
              <Button minimal onClick={() => props.openPermissionDialog(props.currentUser!)}>
                  Grant custom permissions
              </Button>
            }
          </div>

          {
            props.userPermissions
              .sort((a, b) => a.type.localeCompare(b.type))
              .map(perm => (
                <PermissionBar
                  key={perm.permissionId}
                  permission={perm}
                  actions={actions(perm.permissionId)}
                />
              ))
          }
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
  setCurrentUser: currentUser => dispatch(SetPermissionManagerState.create({ open: true, currentUser })),
  openPermissionDialog: user => dispatch(OpenPermissionApplicationDialog.create({ applicationType: 'grant', users: [user] }))
}))(PermissionManagementDialogUI);
