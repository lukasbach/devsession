import {IUserPermission} from "@devsession/common";
import {getPathPermissions, IFileSystemPermissionData, IUser} from "@devsession/common";
import {AuthenticationService} from "./AuthenticationService";

export class PermissionService {

  private authService: AuthenticationService;

  private permissions: { [userId: string]: IUserPermission[] } = {};
  private requestedPermissions: IUserPermission[] = [];
  private permissionCounter = 0;

  constructor(authService: AuthenticationService) {
    this.authService = authService;
  }

  public storePermission(permission: IUserPermission) {
    permission.permissionId = this.getNewPermissionId();
    this.requestedPermissions.push(permission);
  }

  public getPathPermissionsOfUser(path: string, userId: string): IFileSystemPermissionData {
    return getPathPermissions(path, this.authService.getUser(userId), this.permissions[userId] || []);
  }

  public getUserPermissions(userId: string): IUserPermission[] {
    return this.permissions[userId] || [];
  }

  public getNewPermissionId() {
    return this.permissionCounter++;
  }

  public addPermission(userId: string, permission: IUserPermission) {
    if (!this.permissions[userId]) {
      this.permissions[userId] = [];
    }

    this.permissions[userId].push(permission);
  }

  public setPermissionId(permission: IUserPermission): IUserPermission {
    permission.permissionId = this.getNewPermissionId();
    return permission;
  }

  public grantPermissions(permissionIds: number[]): IUserPermission[] {
    const permissions = this.requestedPermissions.filter((p) => permissionIds.includes(p.permissionId));
    const user = this.getConsistentUserFromPermissions(permissions);

    for (const perm of permissions) {
      this.addPermission(user.id, perm);
    }

    this.requestedPermissions = this.requestedPermissions.filter((p) => !permissionIds.includes(p.permissionId));

    return permissions;
  }

  public rejectPermissions(permissionIds: number[]): IUserPermission[] {
    const permissions = this.requestedPermissions.filter((p) => permissionIds.includes(p.permissionId));
    const user = this.getConsistentUserFromPermissions(permissions);

    this.requestedPermissions = this.requestedPermissions.filter((p) => !permissionIds.includes(p.permissionId));

    return permissions;
  }

  public revokePermissions(permissionIds: number[]): IUserPermission[] {
    const permissions: IUserPermission[] = [];

    for (const userId of Object.keys(this.permissions)) {
      permissions.push(...this.permissions[userId].filter((p) => permissionIds.includes(p.permissionId)));
      this.permissions[userId] = this.permissions[userId].filter((p) => !permissionIds.includes(p.permissionId));
    }

    return permissions;
  }

  public createPermissions(permissions: IUserPermission[]): IUserPermission[] {
    const user = this.getConsistentUserFromPermissions(permissions);
    permissions = permissions.map((p) => this.setPermissionId(p));
    permissions.forEach((p) => this.addPermission(user.id, p));
    return permissions;
  }

  /**
   * Check if all permissions have the same user. Also validate all user ids against shouldBeUserId if supplied.
   * Returns the user if everything is correct. Returns null if permission array is empty or permissions have
   * distinct users.
   */
  public getConsistentUserFromPermissions(permissions: IUserPermission[], shouldBeUserId?: string): IUser | null {
    let user: IUser | null = null;

    for (const perm of permissions) {
      if (user && user.id !== perm.userid) {
        return null;
      }

      if (shouldBeUserId && perm.userid !== shouldBeUserId) {
        return null;
      }

      if (!user) {
        user = this.authService.getUser(perm.userid) || null;
      }
    }

    if (!user) {
      throw Error("Inconsistent, wrong or invalid user scheme in permissions");
    }

    return user;
  }
}
