import {IUserEditorPosition, IUserEditorPositionWithRequiredPath} from "../types/editor";

export const validateUserPosition = (position: IUserEditorPosition | IUserEditorPositionWithRequiredPath | undefined): Required<IUserEditorPosition> | undefined => {
  if (!position || !position.path || !position.selection || !position.cursor) {
    return undefined;
  } else {
    return position as Required<IUserEditorPosition>;
  }
};
