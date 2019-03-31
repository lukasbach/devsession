import {editor} from "monaco-editor";
import {DeepPartial} from "./deeppartial";
import {FSAction} from "./fsactions";
import {IUserPermission} from "./permissions";
import {IPortForwardingConfiguration} from "./portforwarding";
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
      path: string,
      changes: editor.IModelContentChange[]
    }>;

    export type OpenedFile = IAuthoredMessageObject<"@@EDITOR/OPEN_FILE", {
      path: string
    }>;

    export type ClosedFile = IAuthoredMessageObject<"@@EDITOR/CLOSE_FILE", {
      path: string
    }>;

    export type NotifyChangedText = IMessageObject<"@@EDITOR/NOTIFY_CHANGED_TEXT", {
      user: string,
      path: string,
      changes: editor.IModelContentChange[]
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
    export type RequestFSAction = IAuthoredMessageObject<"@@FS/REQUEST", {
      action: FSAction
    }>;

    export type NotifyFsAction = IMessageObject<"@@FS/NOTIFY", {
      action: FSAction,
      requestedBy: IUser
    }>;
  }

  export namespace Permissions {
    export type RequestPermission = IAuthoredMessageObject<"@@PERM/REQUEST_FROM_BACKEND", {
      permissions: IUserPermission[]
    }>;

    export type UserHasRequestedPermission = IMessageObject<"@@PERM/REQUEST_FROM_ADMIN", {
      permissions: IUserPermission[],
      user: IUser
    }>;

    export type GrantRequestedPermission = IAuthoredMessageObject<"@@PERM/GRANT", {
      permissionIds: number[]
    }>;

    export type RejectRequestedPermission = IAuthoredMessageObject<"@@PERM/REJECT", {
      permissionIds: number[]
    }>;

    export type CreatePermission = IAuthoredMessageObject<"@@PERM/CREATE", {
      permissions: IUserPermission[];
    }>;

    export type NotifyPermission = IMessageObject<"@@PERM/NOTIFY", {
      permissions: IUserPermission[],
      user: IUser,
      granted: boolean
    }>;

    export type RevokeExistingPermission = IAuthoredMessageObject<"@@PERM/REVOKE", {
      permissionIds: number[]
    }>;
  }

  export namespace Terminal {
    export type NewTerminal = IAuthoredMessageObject<"@@TERMINAL/NEW", {
      path: string;
      description?: string;
    }>;

    export type NotifyNewTerminal = IAuthoredMessageObject<"@@TERMINAL/NOTIFY_NEW", {
      id: number;
      path: string;
      description: string;
    }>;

    export type KillTerminal = IAuthoredMessageObject<"@@TERMINAL/KILL", {
      id: number;
    }>;

    export type NotifyKillTerminal = IAuthoredMessageObject<"@@TERMINAL/NOTIFY_KILL", {
      id: number;
      path: string;
      description: string;
    }>;

    export type OpenTerminal = IAuthoredMessageObject<"@@TERMINAL/OPEN", {
      id: number;
    }>;

    export type CloseTerminal = IAuthoredMessageObject<"@@TERMINAL/CLOSE", {
      id: number
    }>;

    export type SendInput = IAuthoredMessageObject<"@@TERMINAL/IN", {
      id: number;
      data: string;
    }>;

    export type NotifyOutput = IAuthoredMessageObject<"@@TERMINAL/OUT", {
      id: number;
      data: string;
    }>;

    export type RequestTerminalNotifications = IAuthoredMessageObject<"@@TERMINAL/REQ", {}>;
  }
  export namespace PortForwarding {
    export type NewConfig = IAuthoredMessageObject<"@@PORTFORWARDING/NEW", {
      config: IPortForwardingConfiguration;
    }>;

    export type NotifyNewConfig = IAuthoredMessageObject<"@@PORTFORWARDING/NOTIFY_NEW", {
      config: IPortForwardingConfiguration;
      authoringUser: IUser;
    }>;

    export type DeleteConfig = IAuthoredMessageObject<"@@PORTFORWARDING/DELETE", {
      configId: number;
    }>;

    export type NotifyDeleteConfig = IAuthoredMessageObject<"@@PORTFORWARDING/NOTIFY_DELETE", {
      config: IPortForwardingConfiguration;
      authoringUser: IUser;
    }>;
  }
  export namespace Errors {}
}
