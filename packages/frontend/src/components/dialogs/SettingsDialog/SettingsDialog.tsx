import * as React from "react";
import {IAppSettings, IServerSettings, ISettings, IUserSettings} from "@devsession/common";
import {DeepPartial} from "@devsession/common";
import {connect} from "react-redux";
import {IState} from "../../../store";
import {ApplySettings, CloseSettings} from "../../../store/settings";
import {Button, Classes, Dialog, FormGroup, HTMLSelect, InputGroup, Tab, Tabs} from "@blueprintjs/core";
import {useEffect, useState} from "react";
import {ThemedContainer} from "../../common/ThemedContainer";
import {IUser} from "@devsession/common";
import {getMe} from "../../../store/filters";
import {SocketMessages} from "@devsession/common";
import {mergeDeep} from "@devsession/common";
import {SocketServer} from "../../../services/SocketServer";

interface IStateProps {
  settings: ISettings;
  user: IUser
}

interface IDispatchProps {
  applySettings: (settings: DeepPartial<ISettings>) => void;
  changeUser: (data: DeepPartial<IUser>) => void;
  close: () => void;
}

interface IOwnProps {}

type ISettingsProps = IStateProps & IDispatchProps;

interface ISubSettingsProps<T extends object> {
  setSetting: (name: keyof T, value: any) => void;
  subSettings: T;
  user: IUser;
  changeUser: (data: DeepPartial<IUser>) => void;
}

const SettingsDialogUI: React.FunctionComponent<ISettingsProps> = props => {
  const [tab, setTab] = useState<keyof ISettings>("app");

  const [settings, setSettings] = useState(props.settings);
  useEffect(() => setSettings(props.settings), [props.settings]);

  const [changedUserData, setChangedUserData] = useState<DeepPartial<IUser>>({});
  const changeUserDataHandler = (userData: DeepPartial<IUser>) => setChangedUserData(mergeDeep({...changedUserData}, userData));

  return (
    <ThemedContainer render={(theme: string, className: string) => (
      <Dialog
        isOpen={props.settings.areSettingsOpen}
        icon="settings"
        onClose={props.close}
        title="Settings"
        className={className}
      >
        <div className={Classes.DIALOG_BODY}>
          <Tabs id="TabsExample" onChange={tab => setTab(tab as keyof ISettings)} selectedTabId={tab}>
            <Tab
              id="app"
              title="App Settings"
              panel={(
                <AppSettings
                  user={mergeDeep(props.user, changedUserData)}
                  changeUser={changeUserDataHandler}
                  subSettings={settings.app}
                  setSetting={(name,  val) => setSettings({
                    ...settings,
                    app: {
                      ...settings.app,
                      [name]: val
                    }
                  })}
                />
              )}
            />

            <Tab
              id="user"
              title="User Settings"
              panel={(
                <UserSettings
                  user={mergeDeep(props.user, changedUserData)}
                  changeUser={changeUserDataHandler}
                  subSettings={settings.user}
                  setSetting={(name,  val) => setSettings({
                    ...settings,
                    user: {
                      ...settings.user,
                      [name]: val
                    }
                  })}
                />
              )}
            />

            <Tab
              id="server"
              title="Server Settings"
              panel={(
                <ServerSettings
                  user={mergeDeep(props.user, changedUserData)}
                  changeUser={changeUserDataHandler}
                  subSettings={settings.server}
                  setSetting={(name,  val) => setSettings({
                    ...settings,
                    server: {
                      ...settings.server,
                      [name]: val
                    }
                  })}
                />
              )}
            />
          </Tabs>
        </div>

        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button intent={"primary"} onClick={() => {
              props.applySettings(settings);
              props.changeUser(changedUserData);
              props.close();
            }}>
              Apply
            </Button>
          </div>
        </div>
      </Dialog>
    )} />
  )
};

const AppSettings: React.FunctionComponent<ISubSettingsProps<IAppSettings>> = props => {
  const [monacoThemes, setMonacoThemes] = useState<{[key: string]: string}>({});
  useEffect(() => {
    fetch('/themes/themelist.json')
      .then(data => data.json())
      .then(data => {
        setMonacoThemes({
          vs: 'vs',
          'vs-dark': 'vs-dark',
          'hc-black': 'hc-black',
          ...data
        });
      })
  }, []);

  return (
    <div>
      <FormGroup label={'Application theme'}>
        <HTMLSelect
          options={['dark', 'light']}
          value={props.subSettings.applicationTheme}
          onChange={e => props.setSetting('applicationTheme', e.currentTarget.value)}
        />
      </FormGroup>

      <FormGroup label={'Editor theme'}>
        <HTMLSelect
          options={Object.keys(monacoThemes).map(k => ({ label: monacoThemes[k], value: monacoThemes[k] }))}
          value={props.subSettings.monacoTheme}
          onChange={e => props.setSetting('monacoTheme', e.currentTarget.value)}
        />
      </FormGroup>

      <FormGroup
        label={'Allow external navigation'}
        helperText={'You can navigate other users to specific files or code locations with the buttons on the right.' +
          ' Here you can specify how the app should handle such navigation attempts on your user.'}
      >
        <HTMLSelect
          options={[
            { label: 'Always allow external navigation', value: 'always' },
            { label: 'Ask first', value: 'ask' },
            { label: 'Ignore external navigation', value: 'never' },
          ]}
          value={props.subSettings.allowExternalNavigation}
          onChange={e => props.setSetting('allowExternalNavigation', e.currentTarget.value)}
        />
      </FormGroup>
    </div>
  )
};

const UserSettings: React.FunctionComponent<ISubSettingsProps<IUserSettings>> = props => (
  <div>
    <FormGroup
      label="Username"
    >
      <InputGroup
        placeholder="Username"
        value={props.user.name}
        onChange={(e: any) => props.changeUser({ name: e.currentTarget.value })}
      />
    </FormGroup>
  </div>
);

const ServerSettings: React.FunctionComponent<ISubSettingsProps<IServerSettings>> = props => (
  <div>
    aa
  </div>
);


export const SettingsDialog = connect<IStateProps, IDispatchProps, IOwnProps, IState>((state, ownProps) => ({
  settings: state.settings,
  user: getMe(state)
}), (dispatch, ownProps) => ({
  applySettings: settings => dispatch(ApplySettings.create({ settings })),
  close: () => dispatch(CloseSettings.create({})),
  changeUser: userdata => {
    SocketServer.emit<SocketMessages.Users.UserChangedData>("@@USERS/USER_CHANGED_DATA", { userdata })
  }
}))(SettingsDialogUI);
