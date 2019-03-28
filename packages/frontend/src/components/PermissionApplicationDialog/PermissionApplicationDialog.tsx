import * as React from "react";
import {Alert} from "@blueprintjs/core";
import {IFileSystemPermission} from "../../types/permissions";
import {useState} from "react";
import {SocketMessages} from "../../types/communication";
export const PermissionApplicationDialog: React.FunctionComponent<{}> = props => {
  const [application, setApplication] = useState<SocketMessages.InferPayload<SocketMessages.Permissions.UserHasRequestedPermission> | null>(null);

  SocketServer.on<SocketMessages.Permissions.UserHasRequestedPermission>("@@PERM/REQUEST_FROM_ADMIN", payload => {
    console.log(payload);
    setApplication(payload);
  });console.log("!!)");

  const permissionId = application ? application.permission.permissionId : null;
  let text = '';

  if (application) {
    let typedPermission;

    switch (application.permission.type) {
      case "fs":
        typedPermission = application.permission as IFileSystemPermission;
        text += `The user ${application.user.name} has requested the following permissions on the directory `;
        text += `${typedPermission.path}: `;
        text += typedPermission.mayRead ? 'read, ' : '';
        text += typedPermission.mayWrite ? 'write, ' : '';
        text += typedPermission.mayDelete ? 'delete, ' : '';
        text = text.substring(0, text.length - 2);
        text += '.';
        break;

      default:
        text = 'Undefined text...';
    }
  }

  const cancel = () => {
    SocketServer.emit<SocketMessages.Permissions.RejectRequestedPermission>("@@PERM/REJECT", { permissionId: permissionId! });
    setApplication(null);
  };

  const confirm = () => {
    SocketServer.emit<SocketMessages.Permissions.GrantRequestedPermission>("@@PERM/GRANT", { permissionId: permissionId! });
    setApplication(null);
  };

  return (
    <Alert
      isOpen={application !== null}
      cancelButtonText={'Deny'}
      confirmButtonText={'Accept'}
      onCancel={cancel}
      onConfirm={confirm}
    >
      { text }
    </Alert>
  )
};

import {SocketServer} from "../../utils/socket";
