import {setWith, TypedAction, TypedReducer} from "redoodle";
import {IErrorInformation} from "@devsession/common/src/types/errorhandling";
import uuidv4 from 'uuid/v4';

export interface IErrorHandlingState {
  userError?: IErrorInformation;
  serverErrors: IErrorInformation[];
  isServerErrorsDialogOpen: boolean;
}

export const SetUserError = TypedAction.define("@@errorhandling/setusererror")<{
  error: IErrorInformation;
}>();

export const DismissUserError = TypedAction.define("@@errorhandling/dismissusererror")<{}>();

export const ReceiveServerError = TypedAction.define("@@errorhandling/receiveservererror")<{
  error: IErrorInformation;
}>();

export const DismissServerError = TypedAction.define("@@errorhandling/dismissservererror")<{
  errorId: string;
}>();

export const SetServerErrorDialogState = TypedAction.define("@@errorhandling/seterrordialogstate")<{
  isOpen: boolean;
}>();

const assignId = (error: IErrorInformation): IErrorInformation => ({
  ...error,
  id: error.id || uuidv4()
});

const reducer = TypedReducer.builder<IErrorHandlingState>()
  .withHandler(SetUserError.TYPE, (state, { error }) => setWith(state, { userError: assignId(error) }))
  .withHandler(DismissUserError.TYPE, (state, {}) => setWith(state, { userError: undefined }))
  .withHandler(ReceiveServerError.TYPE, (state, { error }) => setWith(state, { serverErrors: [...state.serverErrors, assignId(error)] }))
  .withHandler(DismissServerError.TYPE, (state, { errorId }) => setWith(state, { serverErrors: state.serverErrors.filter(e => e.id !== errorId) }))
  .withHandler(SetServerErrorDialogState.TYPE, (state, { isOpen }) => setWith(state, { isServerErrorsDialogOpen: isOpen }))
  .build();

export default reducer;