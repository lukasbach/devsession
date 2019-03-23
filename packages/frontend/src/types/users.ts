import {IUserEditorPosition} from "./editor";

export interface IUser {
  id: string;
  name: string;
  position: IUserEditorPosition;
}
