import {Store} from "redoodle";
import {IState} from "../store";
import {SocketServer} from "../utils/socket";
import {SocketMessages} from "../types/communication";
import {NewUser, UserChangedData, UserLeft} from "../store/users";
import {appToasterRef} from "../components/AppToaster/AppToaster";
import {IFileSystemPermission} from "../types/permissions";
import {PermissionsReceived, PermissionsRevoked} from "../store/permissions";

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
  }
}