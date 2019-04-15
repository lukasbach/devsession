export interface IUserPermission {
  type: string;
  userid: string;
  permissionId: number;
}

export interface IFileSystemPermission extends IUserPermission, IFileSystemPermissionData {
  type: "fs";
  path: string;
}

export interface IFileSystemPermissionData {
  mayRead: boolean | undefined;
  mayWrite: boolean | undefined;
  mayDelete: boolean | undefined;
}

export interface ITerminalPermission extends IUserPermission {
  type: "terminal";
}

export interface IPortForwardingPermission extends IUserPermission {
  type: "portforwarding";
}

export interface IUserManagementPermission extends IUserPermission {
  type: "usermanagement";
}

export interface IServerManagementPermission extends IUserPermission {
  type: "servermanagement";
}
