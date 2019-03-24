import {combineReducers} from "redoodle";
import FileListReducer, {IOpenFilesState} from "./openFiles";
import UsersReducer, {IUsersState} from "./users";
import SettingsReducer from "./settings";
import {ISettings} from "../types/settings";

export interface IState {
  openFiles: IOpenFilesState,
  users: IUsersState,
  settings: ISettings
}

export default combineReducers<IState>({
  openFiles: FileListReducer,
  users: UsersReducer,
  settings: SettingsReducer
});
