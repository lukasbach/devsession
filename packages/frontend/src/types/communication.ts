import {IUserEditorPosition} from "./editor";
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
      changes: Array<{
        range: {
          startLineNumber: number,
          startColumn: number,
          endLineNumber: number,
          endColumn: number
        },
        rangeLength: number,
        text: string,
        rangeOffset: number,
        forceMoveMarkers: boolean
      }>
    }>;

    export type ChangedPosition = IMessageObject<"@@EDITOR/CHANGED_POSITION", {
      user: string,
      position: Partial<IUserEditorPosition>
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
    export type NewUser = IMessageObject<"@@USERS/NEW_USER", {
      userdata: IUser
    }>;

    export type UserChangedData = IMessageObject<"@@USERS/USER_CHANGED_DATA", {
      user: string,
      userdata: Partial<IUser>
    }>;

    export type UserLeft = IMessageObject<"@@USERS/USER_LEFT", {
      user: string
    }>;
  }
}
