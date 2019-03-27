import * as path from "path";
import {SocketMessages} from "../types/communication";
import {IFileSystemPermission, IFileSystemPermissionData, IUserPermission} from "../types/permissions";
import {IUser} from "../types/users";
import {SocketServer} from "./socket";

export const getPathPermissions = (pathToCheck: string, user: IUser, permissions: IUserPermission[]): IFileSystemPermissionData => {
  const foundPermission = {
    mayRead: false,
    mayWrite: false,
    mayDelete: false
  };

  if (user.isAdmin) {
    return {
      mayRead: true,
      mayWrite: true,
      mayDelete: true
    };
  } else {
    const userFsPermissions = permissions
      .filter((p) => p.userid === user.id)
      .filter((p) => (p as IFileSystemPermission).type === "fs")
      .map((p) => p as IFileSystemPermission);

    if (userFsPermissions.length === 0) {
      return {
        mayRead: false,
        mayWrite: false,
        mayDelete: false
      };
    }

    userFsPermissions
      .sort((a, b) => a.path.length - b.path.length) // TODO correct order?
      .forEach((p) => {
        const normalizedPathToCheck = path.normalize(pathToCheck);
        const normalizedPermissionPath = path.normalize(p.path); // TODO empty path should be root to all other paths
        console.log(pathToCheck, p.path, normalizedPathToCheck, normalizedPermissionPath, path.normalize(pathToCheck).startsWith(path.normalize(p.path)));
        if (normalizedPathToCheck.startsWith(normalizedPermissionPath) || p.path === "") {
          foundPermission.mayRead = foundPermission.mayRead || ((p.mayRead !== undefined) ? p.mayRead : true);
          foundPermission.mayWrite = foundPermission.mayWrite || ((p.mayWrite !== undefined) ? p.mayWrite : true);
          foundPermission.mayDelete = foundPermission.mayDelete || ((p.mayDelete !== undefined) ? p.mayDelete : true);
        }
      });
  }

  return foundPermission;
};

export const mergePathPermissions = (...permissions: IFileSystemPermissionData[]): IFileSystemPermissionData => {
  const perm = {
    mayRead: true,
    mayWrite: true,
    mayDelete: true
  };

  permissions.forEach((p) => {
    perm.mayRead = perm.mayRead && !!p.mayRead;
    perm.mayWrite = perm.mayWrite && !!p.mayWrite;
    perm.mayDelete = perm.mayDelete && !!p.mayDelete;
  });

  return perm;
};

export const requestPathPermission = (requestedPath: string, userId: string, permissionData: IFileSystemPermissionData) => {
  SocketServer.emit<SocketMessages.Permissions.RequestPermission>("@@PERM/REQUEST_FROM_BACKEND", {
    permission: {
      permissionId: -1,
      type: "fs",
      path: requestedPath,
      userid: userId,
      ...permissionData
    } as IFileSystemPermission
  });
};
