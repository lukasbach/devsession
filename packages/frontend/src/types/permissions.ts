export interface IUserPermission {
  userid: string;
  permissionId: number;
}

export interface IFileSystemPermission extends IUserPermission {
  type: "fs";
  path: string;
  mayRead: boolean;
  mayWrite: boolean;
  mayDelete: boolean;
}

export interface ITerminalPermission extends IUserPermission {
  type: "terminal";
}

export interface IPortForwardingPermission extends IUserPermission {
  type: "portforwarding";
  port: string;
}

export interface IUserManagementPermission extends IUserPermission {
  type: "usermanagement";
}

export interface IServerManagementPermission extends IUserPermission {
  type: "servermanagement";
}
