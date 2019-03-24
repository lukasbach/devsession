import {IUserEditorPosition} from "./editor";

export interface IUser {
  id: string;
  name: string;
  position: IUserEditorPosition;
  isAdmin: boolean;
}

export type IUserWithLocalData = IUser & {
  color: IUserColor;
  isItMe?: boolean;
};

export interface IUserColor {
  name: string;
  primaryColor: string;
  lightColor: string;
  darkColor: string;
}
