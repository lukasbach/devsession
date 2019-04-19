import {combineReducers, createStore} from "redoodle";
import FileListReducer, {IOpenFilesState} from "./openFiles";
import UsersReducer, {IUsersState} from "./users";
import SettingsReducer from "./settings";
import PermissionsReducer from "./permissions";
import FsActionDialogReducer from "./fsActionDialog";
import PortForwardingReducer from "./portforwarding";
import TerminalReducer, {ITerminalState} from "./terminal";
import ErrorHandlingReducer, {IErrorHandlingState} from "./errorhandling";
import {ISettings} from "@devsession/common";
import {createLogger} from "redux-logger";
import {applyMiddleware} from "redux";
import {IPermissionsState} from "./permissions";
import {IFsActionDialogState} from "./fsActionDialog";
import {IPortForwardingState} from "./portforwarding";

export interface IState {
  openFiles: IOpenFilesState,
  users: IUsersState,
  settings: ISettings,
  permissions: IPermissionsState,
  fsActionDialog: IFsActionDialogState,
  terminal: ITerminalState,
  portForwarding: IPortForwardingState,
  errorHandling: IErrorHandlingState
}

export const initializeStore = (initialState: IState) => {
  const reducer = combineReducers<IState>({
    openFiles: FileListReducer,
    users: UsersReducer,
    settings: SettingsReducer,
    permissions: PermissionsReducer,
    fsActionDialog: FsActionDialogReducer,
    terminal: TerminalReducer,
    portForwarding: PortForwardingReducer,
    errorHandling: ErrorHandlingReducer
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
      monacoTheme: 'vs-dark',
      allowExternalNavigation: 'always'
    },
    server: {
      defaultPermissions: [],
      userPositionControl: "always"
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
  },
  fsActionDialog: {
    action: undefined
  },
  terminal: {
    terminals: [],
    isTerminalManagerOpen: false
  },
  portForwarding: {
    configurations: [],
    isPortForwardingManagerOpen: false
  },
  errorHandling: {
    isServerErrorsDialogOpen: false,
    userError: undefined,
    serverErrors: []
  }
};