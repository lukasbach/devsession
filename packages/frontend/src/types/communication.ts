import {DeepPartial} from "./deeppartial";
import {IChange} from "./editor";
import {FSAction} from "./fsactions";
import {IUserPermission} from "./permissions";
import {IUser} from "./users";

export namespace SocketMessages {
  export interface IAuthoringUserInformation {
    userId: string;
    authKey: string;
  }

  export interface IMessageObject<MESSAGE extends string, PAYLOAD> {
    message: MESSAGE;
    payload: PAYLOAD;
  }

  export interface IAuthoredMessageObject<MESSAGE extends string, PAYLOAD> extends IMessageObject<MESSAGE, PAYLOAD> {
    message: MESSAGE;
    payload: PAYLOAD;
    auth: IAuthoringUserInformation;
  }

  export type InferText<Type> = Type extends IMessageObject<infer X, any> ? X : null;
  export type InferPayload<Type> = Type extends IMessageObject<any, infer X> ? X : null;

  export namespace Editor {
    export type ChangedText = IAuthoredMessageObject<"@@EDITOR/CHANGED_TEXT", {
      user: string,
      path: string,
      changes: IChange[]
    }>;

    export type OpenedFile = IAuthoredMessageObject<"@@EDITOR/OPEN_FILE", {
      user: string,
      path: string
    }>;

    export type ClosedFile = IAuthoredMessageObject<"@@EDITOR/CLOSE_FILE", {
      user: string,
      path: string
    }>;

    export type NotifyChangedText = IMessageObject<"@@EDITOR/NOTIFY_CHANGED_TEXT", {
      user: string,
      path: string,
      changes: IChange[]
    }>;
  }

  export namespace Users {
    export type UserInitialized = IMessageObject<"@@USERS/INITIALIZE_USER", {
      adminKey?: string;
    }>;

    export type UserInitializedResponse = IMessageObject<"@@USERS/INITIALIZE_RESPONSE", {
      user: IUser;
      authkey: string;
    }>;

    export type NewUser = IMessageObject<"@@USERS/NEW_USER", {
      userdata: IUser
    }>;

    export type UserChangedData = IAuthoredMessageObject<"@@USERS/USER_CHANGED_DATA", {
      userdata: DeepPartial<IUser>
    }>;

    export type NotifyUserChangedData = IMessageObject<"@@USERS/NOTIFY_USER_CHANGED_DATA", {
      user: string,
      userdata: DeepPartial<IUser>
    }>;

    export type UserLeft = IAuthoredMessageObject<"@@USERS/USER_LEFT", {
      user: string
    }>;
  }

  export namespace FileSystem {
    /*
    export type RequestItemCreation = IMessageObject<"@@FS/REQUEST_CREATE_ITEM", {
      path: string,
      filename: string
    }>;

    export type NotifyItemCreation = IMessageObject<"@@FS/NOTIFICATION_CREATE_ITEM", {
      path: string,
      filename: string
    }>;

    export type RequestFileDeletion = IMessageObject<"@@FS/", {
      path: string
    }>;

    export type NotifyFileDeletion = IMessageObject<"@@FS/", {
      path: string
    }>;

    export type RequestFileRename = IMessageObject<"@@FS/", {
      path: string,
      filename: string,
      newName: string
    }>;

    export type NotifyFileRename = IMessageObject<"@@FS/", {
      path: string,
      filename: string,
      newName: string
    }>;

    export type RequestFileCopy = IMessageObject<"@@FS/", {
      pathFrom: string,
      pathTo: string
    }>;

    export type NotifyFileCopy = IMessageObject<"@@FS/", {
      pathFrom: string,
      pathTo: string
    }>;

    export type RequestFileMove = IMessageObject<"@@FS/", {
      pathFrom: string,
      pathTo: string
    }>;

    export type NotifyFileMove = IMessageObject<"@@FS/", {
      pathFrom: string,
      pathTo: string
    }>;
    */

    export type RequestFSAction = IAuthoredMessageObject<"@@FS/", {
      action: FSAction
    }>;

    export type NotifyFsAction = IMessageObject<"@@FS/", {
      action: FSAction,
      requestedBy: IUser
    }>;
  }

  export namespace Permissions {
    export type RequestPermission = IAuthoredMessageObject<"@@PERM/REQUEST_FROM_BACKEND", {
      permission: IUserPermission
    }>;

    export type UserHasRequestedPermission = IMessageObject<"@@PERM/REQUEST_FROM_ADMIN", {
      permission: IUserPermission,
      user: IUser
    }>;

    export type GrantRequestedPermission = IAuthoredMessageObject<"@@PERM/GRANT", {
      permissionId: number
    }>;

    export type RejectRequestedPermission = IAuthoredMessageObject<"@@PERM/REJECT", {
      permissionId: number
    }>;

    export type CreatePermission = IAuthoredMessageObject<"@@PERM/CREATE", {
      permission: IUserPermission;
    }>;

    export type NotifyPermission = IMessageObject<"@@PERM/NOTIFY", {
      permission: IUserPermission,
      user: IUser,
      granted: boolean
    }>;

    export type RevokeExistingPermission = IAuthoredMessageObject<"@@PERM/REVOKE", {
      permissionId: number
    }>;
  }
  export namespace Terminal {}
  export namespace PortForwarding {}
}
