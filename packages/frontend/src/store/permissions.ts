import {setWith, TypedAction, TypedReducer} from "redoodle";
import {IUserPermission} from "../types/permissions";

export interface IPermissionsState {
  permissions: IUserPermission[];
  permissionManager: {
    open: boolean;
    currentUser: string | undefined;
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
  .build();

export default reducer;