import {IFileSystemPermission, IFileSystemPermissionData} from "@devsession/common/src/types/permissions";
import {SocketMessages} from "@devsession/common/src/types/communication";
import {SocketServer} from "../services/SocketServer";

export const requestPathPermission = (requestedPaths: string[], userId: string, permissionData: IFileSystemPermissionData) => {
  SocketServer.emit<SocketMessages.Permissions.RequestPermission>("@@PERM/REQUEST_FROM_BACKEND", {
    permissions: requestedPaths.map((requestedPath) => ({
      permissionId: -1,
      type: "fs",
      path: requestedPath,
      userid: userId,
      ...permissionData
    } as IFileSystemPermission))
  });
};