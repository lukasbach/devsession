import {editor, IPosition, IRange} from "monaco-editor";

export interface IUserEditorPosition {
  path?: string;
  cursor?: IPosition;
  selection?: IRange;
}

export interface IUserEditorPositionWithRequiredPath extends IUserEditorPosition {
  path: string;
}
