import * as React from "react";
import {IAppSettings, IServerSettings, ISettings, IUserSettings} from "../../../types/settings";
import {DeepPartial} from "../../../types/deeppartial";
import {connect} from "react-redux";
import {IState} from "../../../store";
import {ApplySettings, CloseSettings} from "../../../store/settings";
import {Button, Classes, Dialog, FormGroup, HTMLSelect, InputGroup, Tab, Tabs} from "@blueprintjs/core";
import {useEffect, useState} from "react";

interface IStateProps {
  settings: ISettings;
}

interface IDispatchProps {
  applySettings: (settings: DeepPartial<ISettings>) => void;
  close: () => void;
}

interface IOwnProps {}

type ISettingsProps = IStateProps & IDispatchProps;

interface ISubSettingsProps<T extends object> {
  setSetting: (name: keyof T, value: any) => void;
  subSettings: T;
}

const SettingsDialogUI: React.FunctionComponent<ISettingsProps> = props => {
  const [tab, setTab] = useState<keyof ISettings>("app");
  const [settings, setSettings] = useState(props.settings);

  return (
    <div>
      <Dialog
        isOpen={props.settings.areSettingsOpen}
        icon="settings"
        onClose={props.close}
        title="Settings"
      >
        <div className={Classes.DIALOG_BODY}>
          <Tabs id="TabsExample" onChange={tab => setTab(tab as keyof ISettings)} selectedTabId={tab}>
            <Tab
              id="app"
              title="App Settings"
              panel={(
                <AppSettings
                  subSettings={settings.app}
                  setSetting={(name,  val) => setSettings({
                    ...props.settings,
                    app: {
                      ...props.settings.app,
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
                  subSettings={settings.user}
                  setSetting={(name,  val) => setSettings({
                    ...props.settings,
                    user: {
                      ...props.settings.user,
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
                  subSettings={settings.server}
                  setSetting={(name,  val) => setSettings({
                    ...props.settings,
                    server: {
                      ...props.settings.server,
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
              props.close();
            }}>
              Apply
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
};

const AppSettings: React.FunctionComponent<ISubSettingsProps<IAppSettings>> = props => {
  const [monacoThemes, setMonacoThemes] = useState<{[key: string]: string}>({});
  useEffect(() => {
    fetch('/themes/themelist.json')
      .then(data => data.json())
      .then(data => {
        setMonacoThemes({
          ...data,
          vs: 'VS Default',
          'vs-dark': 'VS Dark',
          'hc-black': 'VS High Contrast'
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
          options={Object.keys(monacoThemes).map(k => ({ label: monacoThemes[k], value: k }))}
          value={props.subSettings.monacoTheme}
          onChange={e => props.setSetting('monacoTheme', e.currentTarget.value)}
        />
      </FormGroup>
    </div>
  )
};

const UserSettings: React.FunctionComponent<ISubSettingsProps<IUserSettings>> = props => (
  <div>
    aa
  </div>
);

const ServerSettings: React.FunctionComponent<ISubSettingsProps<IServerSettings>> = props => (
  <div>
    aa
  </div>
);


export const SettingsDialog = connect<IStateProps, IDispatchProps, IOwnProps, IState>((state, ownProps) => ({
  settings: state.settings
}), (dispatch, ownProps) => ({
  applySettings: settings => dispatch(ApplySettings.create({ settings })),
  close: () => dispatch(CloseSettings.create({}))
}))(SettingsDialogUI);
