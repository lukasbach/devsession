import {Button, Drawer, HTMLTable, IconName, Tag} from "@blueprintjs/core";
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
import {CalloutBar} from "../common/CalloutBar/CalloutBar";

interface IStateProps {
  isOpen: boolean;
  currentUser: IUser | undefined;
  userPermissions: IUserPermission[];
}
interface IDispatchProps {
  close: () => void;
  setCurrentUser: (userId: string) => void;
}

const PermissionBar: React.FunctionComponent<{
  isDark?: boolean;
  revoke: () => void;
  text: string | JSX.Element;
  icon: IconName;
}> = props => (
  <CalloutBar
    intent={"none"}
    isDark={props.isDark}
    icon={props.icon}
    text={props.text}
    actions={[{
      text: 'Revoke',
      onClick: props.revoke
    }]}
  />
);

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
          </div>

          {
            props.userPermissions
              .filter(perm => perm.type === "fs")
              .map(perm => perm as IFileSystemPermission)
              .map(perm => (
                <PermissionBar
                  key={perm.permissionId}
                  revoke={() => revokePermission(perm.permissionId)}
                  isDark={theme === 'dark'}
                  text={(
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}>
                      <div>{perm.path}</div>
                      <div>
                        <Tag minimal icon={"eye-on"} rightIcon={perm.mayRead   ? 'tick' : 'cross'}
                             intent={perm.mayRead   ? "success" : "warning"} style={{marginRight: '.3em'}} />
                        <Tag minimal icon={"edit"}   rightIcon={perm.mayWrite  ? 'tick' : 'cross'}
                             intent={perm.mayWrite  ? "success" : "warning"} style={{marginRight: '.3em'}} />
                        <Tag minimal icon={"trash"}  rightIcon={perm.mayDelete ? 'tick' : 'cross'}
                             intent={perm.mayDelete ? "success" : "warning"} style={{marginRight: '.3em'}} />
                      </div>
                    </div>
                  )}
                  icon={"folder-open"}
                />
              ))
          }

          {
            props.userPermissions
              .filter(perm => perm.type === "terminal")
              .map(perm => perm as IFileSystemPermission)
              .map(perm => (
                <PermissionBar
                  key={perm.permissionId}
                  revoke={() => revokePermission(perm.permissionId)}
                  isDark={theme === 'dark'}
                  text={`Terminal access`}
                  icon={"console"}
                />
              ))
          }

          {
            props.userPermissions
              .filter(perm => perm.type === "portforwarding")
              .map(perm => perm as IFileSystemPermission)
              .map(perm => (
                <PermissionBar
                  key={perm.permissionId}
                  revoke={() => revokePermission(perm.permissionId)}
                  isDark={theme === 'dark'}
                  text={`Port Forwarding`}
                  icon={"globe-network"}
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
  setCurrentUser: currentUser => dispatch(SetPermissionManagerState.create({ open: true, currentUser }))
}))(PermissionManagementDialogUI);
