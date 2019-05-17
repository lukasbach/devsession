import {IUserPermission} from "./permissions";

export interface ISettings {
  app: IAppSettings;
  user: IUserSettings;
  server: IServerSettings;
  areSettingsOpen: boolean;
}

export interface IAppSettings {
  applicationTheme: "dark" | "light";
  monacoTheme: string;
  allowExternalNavigation: "always" | "ask" | "never";
}

export interface IUserSettings {

}

export interface IServerSettings {
  defaultPermissions: IUserPermission[];
}
