import {setWith, TypedAction, TypedReducer} from "redoodle";
import {FSAction} from "@devsession/common/src/types/fsactions";

export interface IFsActionDialogState {
  action?: FSAction;
}

export const OpenFsActionDialog = TypedAction.define("@@fsactiondialog/open")<{
  action: FSAction
}>();

export const CloseFsActionDialog = TypedAction.define("@@fsactiondialog/close")<{}>();

const reducer = TypedReducer.builder<IFsActionDialogState>()
  .withHandler(OpenFsActionDialog.TYPE, (state, { action }) => setWith(state, { action }))
  .withHandler(CloseFsActionDialog.TYPE, (state, {}) => setWith(state, { action: undefined }))
  .build();

export default reducer;