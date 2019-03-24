import {combineReducers, createStore} from "redoodle";
import FileListReducer, {IOpenFilesState} from "./openFiles";
import UsersReducer, {IUsersState} from "./users";
import SettingsReducer from "./settings";
import {ISettings} from "../types/settings";
import {createLogger} from "redux-logger";
import {applyMiddleware} from "redux";

export interface IState {
  openFiles: IOpenFilesState,
  users: IUsersState,
  settings: ISettings
}

export const initializeStore = (initialState: IState) => {
  const reducer = combineReducers<IState>({
    openFiles: FileListReducer,
    users: UsersReducer,
    settings: SettingsReducer
  });

  const logger = (createLogger as any)({});

  const store = createStore(
    reducer,
    initialState,
    (applyMiddleware as any)(logger)
  );

  return store;
};

export const defaultState: IState = {
  openFiles: {
    mosaiks: [],
    activeMosaik: ''
  },
  users: {
    users: [],
    colorCounter: 0
  },
  settings: {
    areSettingsOpen: false,
    app: {
      applicationTheme: 'dark',
      monacoTheme: 'vs-dark'
    },
    server: {

    },
    user: {

    }
  }
};