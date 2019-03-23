import {combineReducers} from "redoodle";
import FileListReducer, {IOpenFilesState} from "./openFiles/reducer";
import UsersReducer, {IUsersState} from "./users";

export interface IState {
  openFiles: IOpenFilesState,
  users: IUsersState
}

export default combineReducers<IState>({
  openFiles: FileListReducer,
  users: UsersReducer
});
