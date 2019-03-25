import {setWith, TypedAction, TypedReducer} from "redoodle";
import {IUserPermission} from "../types/permissions";

export interface IPermissionsState {
  permissions: IUserPermission[];
  permissionManager: {
    open: boolean;
    currentUser: string | undefined;
  }
}

export const PermissionReceived = TypedAction.define("@@permission/received")<{
  permission: IUserPermission;
}>();

export const PermissionRevoked = TypedAction.define("@@permission/revoked")<{
  permissionId: number;
}>();

export const SetPermissionManagerState = TypedAction.define("@@permission/setmanager")<{
  open: boolean;
  currentUser: string | undefined;
}>();

const reducer = TypedReducer.builder<IPermissionsState>()
  .withHandler(PermissionReceived.TYPE, (state, { permission }) => {
    return setWith(state, {
      permissions: [...state.permissions, permission]
    });
  })
  .withHandler(PermissionRevoked.TYPE, (state, { permissionId }) => {
    return setWith(state, {
      permissions: state.permissions.filter(p => p.permissionId !== permissionId)
    });
  })
  .withHandler(SetPermissionManagerState.TYPE, (state, { open, currentUser }) => {
    return setWith(state, {
      permissionManager: { open, currentUser }
    });
  })
  .build();

export default reducer;