import {setWith, TypedAction, TypedReducer} from "redoodle";
import {IUserPermission} from "../types/permissions";

export interface IPermissionsState {
  permissions: IUserPermission[]
}

export const PermissionReceived = TypedAction.define("@@permission/received")<{
  permission: IUserPermission;
}>();

export const PermissionRevoked = TypedAction.define("@@permission/revoked")<{
  permissionId: number;
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
  .build();

export default reducer;