export interface ISettings {
  app: IAppSettings;
  user: IUserSettings;
  server: IServerSettings;
  areSettingsOpen: boolean;
}

export interface IAppSettings {
  applicationTheme: 'dark' | 'light';
  monacoTheme: string;
}

export interface IUserSettings {

}

export interface IServerSettings {

}