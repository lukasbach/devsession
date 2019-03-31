import {Store} from "redoodle";
import {IState} from "../store";
import {SocketServer} from "../utils/socket";
import {SocketMessages} from "../types/communication";
import {NewUser, UserChangedData, UserLeft} from "../store/users";
import {appToasterRef} from "../components/AppToaster/AppToaster";
import {IFileSystemPermission} from "../types/permissions";
import {PermissionsReceived, PermissionsRevoked} from "../store/permissions";
import {NewTerminal, ReceiveTerminalOutput, TerminateTerminal} from "../store/terminal";
import {DeletePortForwardingConfiguration, NewPortForwardingConfiguration} from "../store/portforwarding";
import * as React from "react";

export class SocketStoreBindingService {
  public static bindSocketMessagesToStore(store: Store<IState>) {
    SocketServer.on<SocketMessages.Users.NewUser>("@@USERS/NEW_USER", ({ userdata }) => {
      store.dispatch(NewUser.create({ userdata }));
      appToasterRef.show({
        intent: "primary",
        message: `${userdata.name} joined the session.`
      });
    });

    SocketServer.on<SocketMessages.Users.UserLeft>("@@USERS/USER_LEFT", ({ user }) => {
      store.dispatch(UserLeft.create({ userid: user }));
      appToasterRef.show({
        intent: "none",
        message: `${user} left.`
      });
    });

    SocketServer.on<SocketMessages.Users.NotifyUserChangedData>("@@USERS/NOTIFY_USER_CHANGED_DATA", ({ user, userdata }) => {
      store.dispatch(UserChangedData.create({ userid: user, userdata }))
    });

    SocketServer.on<SocketMessages.Permissions.NotifyPermission>("@@PERM/NOTIFY", ({ user, permissions, granted }) => {
      if (granted) {
        store.dispatch(PermissionsReceived.create({ permissions }));
        appToasterRef.show({
          intent: "primary",
          message: `${user.name} was granted access to ${(permissions as IFileSystemPermission[]).map(p => p.path).reduce((a, b) => a + ', ' + b, '')}`
        });
      } else {
        store.dispatch(PermissionsRevoked.create({ permissionIds: permissions.map(p => p.permissionId) }));
        appToasterRef.show({
          intent: "warning",
          message: `${user.name} was denied access to ${(permissions as IFileSystemPermission[]).map(p => p.path).reduce((a, b) => a + ', ' + b, '')}`
        });
      }
    });

    SocketServer.on<SocketMessages.Terminal.NotifyNewTerminal>("@@TERMINAL/NOTIFY_NEW", ({ id, description, path }) => {
      store.dispatch(NewTerminal.create({ terminal: { id, description, path, isOpen: false, output: '' } }))
    });

    SocketServer.on<SocketMessages.Terminal.NotifyKillTerminal>("@@TERMINAL/NOTIFY_KILL", ({ id, description, path }) => {
      store.dispatch(TerminateTerminal.create({ terminalId: id }))
    });

    SocketServer.on<SocketMessages.Terminal.NotifyOutput>("@@TERMINAL/OUT", ({ id, data }) => {
      store.dispatch(ReceiveTerminalOutput.create({ terminalId: id, data }))
    });

    SocketServer.on<SocketMessages.PortForwarding.NotifyNewConfig>("@@PORTFORWARDING/NOTIFY_NEW", ({ config, authoringUser }) => {
      appToasterRef.show({
        intent: "primary",
        timeout: 12000,
        message: (
          <div>
            { authoringUser.name } started forwarding { isNaN(config.addr as number) ? config.addr : `Port ${config.addr}` }
            ({config.protocol}) to <a href={config.url}>{config.url}</a>.
          </div>
        )
      });

      store.dispatch(NewPortForwardingConfiguration.create({ config }));
    });

    SocketServer.on<SocketMessages.PortForwarding.NotifyDeleteConfig>("@@PORTFORWARDING/NOTIFY_DELETE", ({ config, authoringUser }) => {
      appToasterRef.show({
        intent: "danger",
        message: (
          <div>
            { authoringUser.name } stopped forwarding { isNaN(config.addr as number) ? config.addr : `Port ${config.addr}` }
            ({config.protocol}) to {config.url}.
          </div>
        )
      });

      store.dispatch(DeletePortForwardingConfiguration.create({ configId: config.id }));
    });
  }
}