import * as path from "path";
import {SocketMessages} from "../types/communication";
import {FSAction, IFsCopyAction, IFsCreationAction, IFsDeletionAction, IFsRenameAction} from "../types/fsactions";
import {IFileSystemPermission, IFileSystemPermissionData, IUserPermission} from "../types/permissions";
import {IUser} from "../types/users";
import {normalizeProjectPath} from "./projectpath";

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

export const areFsPermissionDatasetsEqual = (p1: IFileSystemPermissionData, p2: IFileSystemPermissionData): boolean => {
  // TODO
  return JSON.stringify(p1) === JSON.stringify(p2);
};

export const getPermissionTextForFiles = (permissions: IFileSystemPermissionData, multipleFiles: boolean) => {
  const filesString = `file${multipleFiles ? "s" : ""}`;
  const itThem = multipleFiles ? "them" : "it";

  if (permissions.mayRead && permissions.mayWrite && permissions.mayDelete) {
    return `You have full access to the ${filesString}`;
  }
  if (permissions.mayRead && permissions.mayWrite && !permissions.mayDelete) {
    return `You can read and write on the ${filesString}, but you can't delete ${itThem}.`;
  }
  if (permissions.mayRead && !permissions.mayWrite && permissions.mayDelete) {
    return `You can read and delete the ${filesString}, but you can't write on ${itThem}.`;
  }
  if (!permissions.mayRead && permissions.mayWrite && permissions.mayDelete) {
    return `You can write on and delete the ${filesString}, but you can't read ${itThem}.`;
  }
  if (!permissions.mayRead && !permissions.mayWrite && permissions.mayDelete) {
    return `You can only delete the ${filesString}.`;
  }
  if (!permissions.mayRead && permissions.mayWrite && !permissions.mayDelete) {
    return `You can only write on the ${filesString}.`;
  }
  if (permissions.mayRead && !permissions.mayWrite && !permissions.mayDelete) {
    return `You can only read the ${filesString}.`;
  }
  if (!permissions.mayRead && !permissions.mayWrite && !permissions.mayDelete) {
    return `You have no permissions on the ${filesString}.`;
  }
};

export const isFsActionAllowed = (
  action: FSAction,
  userPermissions: IUserPermission[],
  user: IUser
): boolean => {
  const fsPermissions = userPermissions
    .filter((p) => p.type === "fs" && p.userid === user.id)
    .map((p) => p as IFileSystemPermission);

  switch (action.type) {
    case "create":
      return getPathPermissions((action as IFsCreationAction).path, user, fsPermissions).mayWrite || false;

    case "delete":
      return mergePathPermissions(
        ...((action as IFsDeletionAction).paths.map((p) => getPathPermissions(p, user, fsPermissions)))
      ).mayDelete || false;

    case "rename":
      return (
        (getPathPermissions((action as IFsRenameAction).pathFrom, user, fsPermissions).mayRead || false)
        && (getPathPermissions((action as IFsRenameAction).pathTo, user, fsPermissions).mayWrite || false)
      );

    case "copy":
      return (
        (getPathPermissions((action as IFsCopyAction).pathFrom, user, fsPermissions).mayRead || false)
        && (getPathPermissions((action as IFsCopyAction).pathTo, user, fsPermissions).mayWrite || false)
      );
  }

  return false;
};

export const hasUserTerminalAccess = (user: IUser, permissions: IUserPermission[]): boolean => {
  return user.isAdmin || !!permissions.find((p) => p.userid === user.id && p.type === "terminal");
};

export const hasUserPortForwardingAccess = (user: IUser, permissions: IUserPermission[]): boolean => {
  return user.isAdmin || !!permissions.find((p) => p.userid === user.id && p.type === "portforwarding");
};
