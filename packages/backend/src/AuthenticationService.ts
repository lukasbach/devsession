import chalk from "chalk";
import uuidv4 from "uuid/v4";
import {DeepPartial} from "../../frontend/src/types/deeppartial";
import {IUser} from "../../frontend/src/types/users";
import {mergeDeep} from "../../frontend/src/utils/deepmerge";
import {hasUserTerminalAccess} from "../../frontend/src/utils/permissions";

const theAdminKey = "key";

export class AuthenticationService {

  private users: IUser[] = [];
  private inactiveUsers: IUser[] = [];
  private authKeys: {[userId: string]: string} = {};
  private socketIds: Array<{ socketId: string; userId: string }> = [];

  public createUser(adminKey?: string): { userId: string, authKey: string } {
    return this.addUser({
      id: "",
      name: "New user",
      isAdmin: false,
      position: {}
    }, adminKey);
  }

  public addUser(userData: IUser, adminKey?: string): { userId: string, authKey: string } {
    const authData = {
      userId: uuidv4(),
      authKey: uuidv4()
    };

    userData.id = authData.userId;
    userData.isAdmin = adminKey && adminKey === theAdminKey;

    this.users.push(userData);
    this.authKeys[authData.userId] = authData.authKey;

    return authData;
  }

  public getAuthKeyForUser(userId: string): string {
    return this.authKeys[userId];
  }

  public validateAuth(userId: string, authKey: string): boolean {
    if (!this.users.find((u) => u.id === userId)) {
      throw Error(`The user to be validated (${userId}) is not stored in the backend.`);
    }

    if (!Object.keys(this.authKeys).includes(userId)) {
      console.error(`Validating user ${userId}:${authKey}, user exists but userid not stored in authmap.`);
      return false;
    }

    if (this.authKeys[userId] !== authKey) {
      console.error(`Validating user ${userId}:${authKey}, but authkey does not match record.`);
      return false;
    }

    return true;
  }

  public getUser(userId: string): IUser | undefined {
    return this.users.find((u) => u.id === userId);
  }

  public getAllUsers(): IUser[] {
    return this.users;
  }

  public modifyUser(userId: string, userData: DeepPartial<IUser>) {
    let found = false;

    this.users = this.users.map((u) => {
      if (u.id === userId) {
        found = true;
        return mergeDeep(
          u,
          userData,
          {
            id: u.id,
            isAdmin: u.isAdmin
          }
        );
      } else {
        return u;
      }
    });

    if (!found) {
      throw Error("Attempted to modify user data, but the user was not found with the given ID");
    }
  }

  public makeUserInactive(userId: string) {
    const user = this.users.find((u) => u.id === userId);
    this.users = this.users.filter((u) => u.id !== userId);
    this.inactiveUsers.push(user);
  }

  public reactivateUser(userId: string): IUser {
    const user = this.inactiveUsers.find((u) => u.id === userId);
    this.users = this.inactiveUsers.filter((u) => u.id !== userId);
    this.users.push(user);
    return user;
  }

  public associateSocketIdToUserId(socketId: string, userId: string) {
    this.deassociateSocketId(socketId);
    this.socketIds.push({ userId, socketId });
  }

  public deassociateSocketId(socketId: string) {
    this.socketIds = this.socketIds.filter((i) => i.socketId !== socketId);
  }

  public getUserIdFromSocketId(socketId: string): string | undefined {
    const result = this.socketIds.find((i) => i.socketId === socketId);
    return result ? result.userId : undefined;
  }

  public getSocketIdFromUserId(userId: string): string | undefined {
    const result = this.socketIds.find((i) => i.userId === userId);
    return result ? result.socketId : undefined;
  }

  public getAdmins(): IUser[] {
    return this.users.filter((u) => u.isAdmin);
  }

  public setUserAdminStatus(userId: string, isAdmin: boolean) {
    const user = this.users.find((u) => u.id === userId);

    if (!user) {
      throw Error(`Could not change the admin status for the user with the ID ${userId}, the user was not found.`);
    }

    user.isAdmin = isAdmin;
  }
}
