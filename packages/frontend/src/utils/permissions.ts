import * as path from "path";
import {SocketMessages} from "../types/communication";
import {IFileSystemPermission, IFileSystemPermissionData, IUserPermission} from "../types/permissions";
import {IUser} from "../types/users";
import {normalizeProjectPath} from "./projectpath";
import {SocketServer} from "./socket";

export const getPathPermissions = (pathToCheck: string, user: IUser, permissions: IUserPermission[]): IFileSystemPermissionData => {
  pathToCheck = normalizeProjectPath(pathToCheck);

  const foundPermission = {
    mayRead: false,
    mayWrite: false,
    mayDelete: false
  };

  if (path.relative("root", pathToCheck).startsWith("..")) {
    // Path is relative and outside of root, do not allow!
    return foundPermission;
  }

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
        const normalizedPermissionPath = normalizeProjectPath(p.path);
        if (pathToCheck.startsWith(normalizedPermissionPath)) {
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

export const areFsPermissionDatasetsEqual = (p1: IFileSystemPermissionData, p2: IFileSystemPermissionData): boolean => {
  // TODO
  return JSON.stringify(p1) === JSON.stringify(p2);
};
