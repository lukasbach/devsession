import {Store} from "redoodle";
import {IState} from "../store";
import {SocketServer} from "../utils/socket";
import {SocketMessages} from "../types/communication";
import {NewUser, UserChangedData, UserLeft} from "../store/users";
import {PermissionReceived, PermissionRevoked} from "../store/permissions";
import {appToasterRef} from "../components/AppToaster/AppToaster";
import {IFileSystemPermission} from "../types/permissions";

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

    SocketServer.on<SocketMessages.Users.UserChangedData>("@@USERS/USER_CHANGED_DATA", ({ user, userdata }) => {
      store.dispatch(UserChangedData.create({ userid: user, userdata }))
    });

    SocketServer.on<SocketMessages.Permissions.NotifyPermission>("@@PERM/NOTIFY", ({ user, permission, granted }) => {
      if (granted) {
        store.dispatch(PermissionReceived.create({ permission }));
        appToasterRef.show({
          intent: "primary",
          message: `${user.name} was granted access to ${(permission as IFileSystemPermission).path}`
        });
      } else {
        store.dispatch(PermissionRevoked.create({ permissionId: permission.permissionId }));
        appToasterRef.show({
          intent: "warning",
          message: `${user.name} was denied access to ${(permission as IFileSystemPermission).path}`
        });
      }
    });
  }
}