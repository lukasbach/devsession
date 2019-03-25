import {combineReducers, createStore} from "redoodle";
import FileListReducer, {IOpenFilesState} from "./openFiles";
import UsersReducer, {IUsersState} from "./users";
import SettingsReducer from "./settings";
import PermissionsReducer from "./permissions";
import {ISettings} from "../types/settings";
import {createLogger} from "redux-logger";
import {applyMiddleware} from "redux";
import {IPermissionsState} from "./permissions";

export interface IState {
  openFiles: IOpenFilesState,
  users: IUsersState,
  settings: ISettings,
  permissions: IPermissionsState
}

export const initializeStore = (initialState: IState) => {
  const reducer = combineReducers<IState>({
    openFiles: FileListReducer,
    users: UsersReducer,
    settings: SettingsReducer,
    permissions: PermissionsReducer
  });

  const logger = (createLogger as any)({
    collapsed: true
  });

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
  },
  permissions: {
    permissions: [],
    permissionManager: {
      open: false,
      currentUser: undefined
    }
  }
};