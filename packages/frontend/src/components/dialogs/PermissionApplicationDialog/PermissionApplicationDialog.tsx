import * as React from "react";
import {useEffect, useState} from "react";
import {IFileSystemPermission, IFileSystemPermissionData, IUserPermission} from "../../../types/permissions";
import {Classes, Dialog, Switch} from "@blueprintjs/core";
import {ThemedContainer} from "../../common/ThemedContainer";
import {UserSelection} from "../../common/UserSelection";
import {IUserWithLocalData} from "../../../types/users";
import {CalloutBar} from "../../common/CalloutBar/CalloutBar";
import {FileListUI} from "../../FileList/FileListUI";
import {PermissionBar} from "../../common/PermissionBar/PermissionBar";
import {DialogFooter} from "../../common/DialogFooter/DialogFooter";
import {connect} from "react-redux";
import {IState} from "../../../store";
import {ClosePermissionApplicationDialog} from "../../../store/permissions";
import {getMe} from "../../../store/filters";
import {SocketServer} from "../../../utils/socket";
import {SocketMessages} from "../../../types/communication";

interface IIsDarkProps { isDark: boolean }


const SelectPermissionTypeForm: React.FunctionComponent<IIsDarkProps & {
  selectType: (permissionType: string) => void;
  onClose: () => void;
  setPermissions: (permissions: IUserPermission[]) => void;
}> = props => (
  <div>
    <CalloutBar text={'Filesystem access permission'} icon={"folder-open"} isDark={props.isDark} actions={[{
      text: 'Select',
      onClick: () =>  props.selectType('fs')
    }]}/>

    <CalloutBar text={'Terminal access permission'} icon={"console"} isDark={props.isDark} actions={[{
      text: 'Select',
      onClick: () =>  {
        props.selectType('fs');
        props.setPermissions([{ type: 'terminal', userid: '__', permissionId: -1 }]);
      }
    }]}/>

    <CalloutBar text={'Port Forwarding Permission'} icon={"globe-network"} isDark={props.isDark} actions={[{
      text: 'Select',
      onClick: () =>  {
        props.selectType('portforwarding');
        props.setPermissions([{ type: 'portforwarding', userid: '__', permissionId: -1 }]);
      }
    }]}/>

    <br />
    
    <DialogFooter onCancel={props.onClose}/>
  </div>
);

const PermissionFormFS: React.FunctionComponent<IIsDarkProps & {
  onClose: () => void;
  confirm: (permissions: IFileSystemPermission[]) => void;
}> = props => {
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [permission, setPermissions] = useState<IFileSystemPermissionData>({
    mayRead: undefined,
    mayWrite: undefined,
    mayDelete: undefined
  });

  return (
    <>
      <div style={{
        display: 'flex'
      }}>
        <div>
          <FileListUI
            noContextMenu={true}
            onSelect={setSelectedPaths}
            openFile={() => null}
            closeFile={() => null}
            watchedFiles={[]}
            getPathPermissions={_ => ({ mayRead: true, mayWrite: true, mayDelete: true })}
            requestPathPermission={() => null}
          />
        </div>
        <div style={{ margin: '1em' }}>
          <p>The user will be granted the following access rights to the selected paths:</p>

          <Switch label={'Can Read'} checked={permission.mayRead}
                  onChange={event => setPermissions({...permission, mayRead: (event.target as HTMLInputElement).checked})} />
          <Switch label={'Can Write'} checked={permission.mayWrite}
                  onChange={event => setPermissions({...permission, mayWrite: (event.target as HTMLInputElement).checked})} />
          <Switch label={'Can Delete'} checked={permission.mayDelete}
                  onChange={event => setPermissions({...permission, mayDelete: (event.target as HTMLInputElement).checked})} />
        </div>
      </div>

      <DialogFooter
        confirmText={'Okay'}
        onCancel={props.onClose}
        onConfirm={() => {
          props.confirm(selectedPaths.map(path => ({
            permissionId: -1,
            type: 'fs' as 'fs',
            userid: '__',
            path, ...permission
          })))
        }}
      />
    </>
  )
};

const PermissionsOverview: React.FunctionComponent<IIsDarkProps & {
  onClose: () => void;
  onConfirm: () => void;
  permissions: IUserPermission[];
  users: IUserWithLocalData[];
  applicationType: 'request' | 'grant';
}> = props => {

  return (
    <>
      <div className={Classes.DIALOG_BODY}>
        {
          props.applicationType === "grant"
            ? `Do you want to grant the following permissions to the users: ${props.users.map(u => u.name).join(', ')}?`
            : 'Do you want to request the following permissions?'
        }
      </div>

      {
        props.permissions.map((p, i) => <PermissionBar permission={p} key={i}/>)
      }

      <br />

      <DialogFooter
        onConfirm={props.onConfirm}
        onCancel={props.onClose}
        confirmText={props.applicationType === "grant" ? 'Grant Permissions' : 'Request permissions'}
      />
    </>
  )
};

interface IStateProps {
  isOpen: boolean;
  users: IUserWithLocalData[];
  applicationType: 'request' | 'grant';
  allUsers: IUserWithLocalData[];
}
interface IDispatchProps {
  onClose: () => void;
  onConfirm: (users: IUserWithLocalData[], permissions: IUserPermission[], applicationType: 'request' | 'grant') => void;
}

export const PermissionApplicationDialogUI: React.FunctionComponent<IStateProps & IDispatchProps> = props => {
  const [users, setUsers] = useState<IUserWithLocalData[]>([]);
  const [permissionType, setPermissionType] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<IUserPermission[]>([]);

  useEffect(() => setUsers(props.users), [props.users]);

  const onClose = () => {
    props.onClose();
    setUsers([]);
    setPermissionType(null);
    setPermissions([]);
  };

  const onConfirm = () => {
    props.onConfirm(users, permissions, props.applicationType);
    onClose();
  };

  let currentForm: (isDark: boolean) => JSX.Element;

  if (users.length === 0) {
    currentForm = isDark => (
      <>
        <div className={Classes.DIALOG_BODY}>
          Search for users to grant permissions to in the search bar above.
        </div>
        <DialogFooter onCancel={onClose} />
      </>
    );
  } else if (!permissionType) {
    currentForm = isDark => (
      <SelectPermissionTypeForm
        selectType={setPermissionType}
        isDark={isDark}
        onClose={onClose}
        setPermissions={setPermissions}
      />
    );
  } else if (permissionType === 'fs' && permissions.length === 0) {
    currentForm = isDark => <PermissionFormFS isDark={isDark} onClose={onClose} confirm={setPermissions} />;
  } else {
    currentForm = isDark => (
      <PermissionsOverview
        isDark={isDark}
        onClose={onClose}
        onConfirm={onConfirm}
        permissions={permissions}
        users={users}
        applicationType={props.applicationType}
      />
    );
  }

  const userSelection = (
    <div className={Classes.DIALOG_BODY}>
      <UserSelection
        fill={true}
        users={props.allUsers}
        onSelect={setUsers}
        multiple={true}
      />
    </div>
  );

  return (
    <ThemedContainer render={(theme: string, className: string) => (
      <Dialog
        className={className}
        isOpen={props.isOpen}
        onClose={onClose}
      >
        {
          props.users.length === 0
            ? userSelection
            : (
              <div className={Classes.DIALOG_HEADER}>
                {
                  props.applicationType === "grant"
                    ? `New permissions for ${users.map(u => u.name).join(', ')}`
                    : 'Requesting permissions'
                }
              </div>
            )
        }

        { currentForm(theme === 'dark') }
      </Dialog>
    )} />
  );
};

export const PermissionApplicationDialog = connect<IStateProps, IDispatchProps, {}, IState>((state, ownProps) => ({
  isOpen: !!state.permissions.permissionApplicationDialog,
  users: state.permissions.permissionApplicationDialog
    ? state.permissions.permissionApplicationDialog.users
      ? state.permissions.permissionApplicationDialog.users
      : state.permissions.permissionApplicationDialog.applicationType === "grant"
        ? []
        : [getMe(state)]
    : [],
  applicationType: state.permissions.permissionApplicationDialog ? state.permissions.permissionApplicationDialog.applicationType : 'grant',
  allUsers: state.users.users
}), (dispatch, ownProps) => ({
  onClose: () => dispatch(ClosePermissionApplicationDialog.create({})),
  onConfirm: (users, permissions, applicationType) => {
    const actualPermissions: IUserPermission[] = [];

    for (const p of permissions) {
      for (const u of users) {
        actualPermissions.push({...p, userid: u.id});
      }
    }

    if (applicationType === 'grant') {
      SocketServer.emit<SocketMessages.Permissions.CreatePermission>("@@PERM/CREATE", {
        permissions: actualPermissions
      });
    } else {
      SocketServer.emit<SocketMessages.Permissions.RequestPermission>("@@PERM/REQUEST_FROM_BACKEND", {
        permissions: actualPermissions
      });
    }
  }
}))(PermissionApplicationDialogUI);
