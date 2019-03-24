import {DeepPartial} from "./deeppartial";
import {IChange} from "./editor";
import {FSAction} from "./fsactions";
import {IUser} from "./users";

export namespace SocketMessages {
  export interface IMessageObject<MESSAGE extends string, PAYLOAD> {
    message: MESSAGE;
    payload: PAYLOAD;
  }

  export type InferText<Type> = Type extends IMessageObject<infer X, any> ? X : null;
  export type InferPayload<Type> = Type extends IMessageObject<any, infer X> ? X : null;

  export namespace Editor {
    export type ChangedText = IMessageObject<"@@EDITOR/CHANGED_TEXT", {
      user: string,
      path: string,
      changes: IChange[]
    }>;

    export type OpenedFile = IMessageObject<"@@EDITOR/OPEN_FILE", {
      user: string,
      path: string
    }>;

    export type ClosedFile = IMessageObject<"@@EDITOR/CLOSE_FILE", {
      user: string,
      path: string
    }>;
  }

  export namespace Users {
    export type UserInitialized = IMessageObject<"@@USERS/INITIALIZE_USER", {}>;

    export type UserInitializedResponse = IMessageObject<"@@USERS/INITIALIZE_RESPONSE", {
      id: string,
      name: string
    }>;

    export type NewUser = IMessageObject<"@@USERS/NEW_USER", {
      userdata: IUser
    }>;

    export type UserChangedData = IMessageObject<"@@USERS/USER_CHANGED_DATA", {
      user: string,
      userdata: DeepPartial<IUser>
    }>;

    export type UserLeft = IMessageObject<"@@USERS/USER_LEFT", {
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

    export type RequestFSAction = IMessageObject<"@@FS/", {
      action: FSAction
    }>;

    export type NotifyFsAction = IMessageObject<"@@FS/", {
      action: FSAction,
      requestedBy: IUser
    }>;
  }

  export namespace Permissions {}
  export namespace Terminal {}
  export namespace PortForwarding {}
}
