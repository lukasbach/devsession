import * as React from "react";
import {useState} from "react";
import {Button, Classes, Dialog} from "@blueprintjs/core";
import {SocketMessages} from "@devsession/common";
import {ThemedContainer} from "../../common/ThemedContainer";
import {PermissionBar} from "../../common/PermissionBar/PermissionBar";
import {SocketServer} from "../../../services/SocketServer";

export const PermissionRequestDialog: React.FunctionComponent<{}> = props => {
  const [application, setApplication] = useState<SocketMessages.InferPayload<SocketMessages.Permissions.UserHasRequestedPermission> | null>(null);

  // TODO do somewhere else, because every time the component un- and remounts, a new handler is created.
  SocketServer.on<SocketMessages.Permissions.UserHasRequestedPermission>("@@PERM/REQUEST_FROM_ADMIN", payload => {
    console.log(payload);
    setApplication(payload);
  });

  const permissionIds = application ? application.permissions.map(p => p.permissionId) : [];

  const cancel = () => {
    SocketServer.emit<SocketMessages.Permissions.RejectRequestedPermission>("@@PERM/REJECT", { permissionIds });
    setApplication(null);
  };

  const confirm = () => {
    SocketServer.emit<SocketMessages.Permissions.GrantRequestedPermission>("@@PERM/GRANT", { permissionIds });
    setApplication(null);
  };

  return (
    <ThemedContainer render={(theme: 'dark' | 'light', className: string) => (
      <Dialog
        className={className}
        isOpen={application !== null}
        onClose={cancel}
      >
        <div className={Classes.DIALOG_BODY}>
          The User { application && application.user.name } has requested the following permissions:
        </div>

        {
          application && application.permissions.map(perm => (
            <PermissionBar key={perm.permissionId} permission={perm}/>
          ))
        }

        <div className={Classes.DIALOG_FOOTER} style={{ marginTop: '10px' }}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={cancel}> Reject </Button>
            <Button intent={"primary"} onClick={confirm}> Grant </Button>
          </div>
        </div>
      </Dialog>
    )} />
  )
};
