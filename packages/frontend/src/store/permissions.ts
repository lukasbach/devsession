import {setWith, TypedAction, TypedReducer} from "redoodle";
import {IUserPermission} from "../types/permissions";
import {IUserWithLocalData} from "../types/users";

export interface IPermissionsState {
  permissions: IUserPermission[];
  permissionManager: {
    open: boolean;
    currentUser: string | undefined;
  };
  permissionApplicationDialog?: {
    users?: IUserWithLocalData[];
    applicationType: 'request' | 'grant';
  }
}

export const PermissionsReceived = TypedAction.define("@@permission/received")<{
  permissions: IUserPermission[];
}>();

export const PermissionsRevoked = TypedAction.define("@@permission/revoked")<{
  permissionIds: number[];
}>();

export const SetPermissionManagerState = TypedAction.define("@@permission/setmanager")<{
  open: boolean;
  currentUser: string | undefined;
}>();

export const OpenPermissionApplicationDialog = TypedAction.define("@@permission/openapplication")<{
  users?: IUserWithLocalData[];
  applicationType: 'request' | 'grant';
}>();

export const ClosePermissionApplicationDialog = TypedAction.define("@@permission/closeapplication")<{}>();

const reducer = TypedReducer.builder<IPermissionsState>()
  .withHandler(PermissionsReceived.TYPE, (state, { permissions }) => {
    return setWith(state, {
      permissions: [...state.permissions, ...permissions]
    });
  })
  .withHandler(PermissionsRevoked.TYPE, (state, { permissionIds }) => {
    return setWith(state, {
      permissions: state.permissions.filter(p => !permissionIds.includes(p.permissionId))
    });
  })
  .withHandler(SetPermissionManagerState.TYPE, (state, { open, currentUser }) => {
    return setWith(state, {
      permissionManager: { open, currentUser }
    });
  })
  .withHandler(OpenPermissionApplicationDialog.TYPE, (state, { users, applicationType }) => {
    return setWith(state, {
      permissionApplicationDialog: {
        users: users,
        applicationType
      }
    });
  })
  .withHandler(ClosePermissionApplicationDialog.TYPE, (state, {}) => {
    return setWith(state, {
      permissionApplicationDialog: undefined
    });
  })
  .build();

export default reducer;