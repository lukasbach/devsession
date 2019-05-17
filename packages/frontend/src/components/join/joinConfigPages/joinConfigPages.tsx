import * as React from "react";
import {Button, FormGroup, IconName, InputGroup, IPanelProps} from "@blueprintjs/core";
import {JoinConfigPage} from "../JoinConfigPage/JoinConfigPage";
import {ToggleCards} from "../../common/ToggleCard/ToggleCards";
import {
  DeepPartial,
  IFileSystemPermission, IPortForwardingPermission,
  ISettings,
  ITerminalPermission,
  IUser,
  IUserPermission,
  mergeDeep
} from "@devsession/common";
import {useEffect, useState} from "react";
import {generatePermission} from "@devsession/common";

export interface IJoinConfig {
  user: DeepPartial<IUser>;
  settings: DeepPartial<ISettings>;
  openPort: boolean;
}

interface IJoinConfigPageProps {
  data: IJoinConfig;
  setData: (data: IJoinConfig) => void;
  onContinue?: () => void;
  onBack?: () => void;
  isDark: boolean;
}

export const SelectDefaultPermissions: React.FunctionComponent<IJoinConfigPageProps> = props => {
  // TODO this does not need to be stateful, this can be a stateless function which just uses external state

  const [selected, setSelected] = useState<string[]>([]);

  // Initial settings
  useEffect(() => {
    const initial: string[] = [];

    if (props.data.settings.server && props.data.settings.server.defaultPermissions) {
      if (props.data.settings.server!.defaultPermissions!.find(p => p.type === 'fs' && !!(p as IFileSystemPermission).mayRead)) {
        initial.push('read');
      }
      if (props.data.settings.server!.defaultPermissions!.find(p => p.type === 'fs' && !!(p as IFileSystemPermission).mayWrite)) {
        initial.push('write');
      }
      if (props.data.settings.server!.defaultPermissions!.find(p => p.type === 'fs' && !!(p as IFileSystemPermission).mayDelete)) {
        initial.push('delete');
      }
      if (props.data.settings.server!.defaultPermissions!.find(p => p.type === 'terminal')) {
        initial.push('terminal');
      }
      if (props.data.settings.server!.defaultPermissions!.find(p => p.type === 'portforwarding')) {
        initial.push('portforwarding');
      }
    }

    setSelected(initial);
  }, []);

  // Propagate on change settings
  useEffect(() => {
    const defaultPermissions: IUserPermission[] = [];

    defaultPermissions.push(
      generatePermission.fs(
        selected.includes('read'),
        selected.includes('write'),
        selected.includes('delete'),
        'root'
      )
    );

    if (selected.includes('terminal')) {
      defaultPermissions.push(generatePermission.terminal());
    }

    if (selected.includes('portforwarding')) {
      defaultPermissions.push(generatePermission.portforwarding());
    }

    props.setData(mergeDeep({...props.data}, {
      settings: { server: { defaultPermissions } }
    }))
  }, [selected]);

  return (
    <JoinConfigPage
      title={'Select default permissions'}
      description={'These permissions bla bla bla'}
      onContinue={props.onContinue}
      onBack={props.onBack}
    >
      <ToggleCards
        isDark={props.isDark}
        itemsPerCol={3}
        multiple={true}
        selected={selected}
        onChange={setSelected}
        options={[
          { key: 'read',   title: 'Read permission',   icon: 'eye-open' as IconName },
          { key: 'write',  title: 'Write permission',  icon: 'edit'     as IconName },
          { key: 'delete', title: 'Delete permission', icon: 'trash'    as IconName },
          { key: 'terminal', title: 'Terminal access', icon: 'terminal' as IconName },
          { key: 'portforwarding', title: 'Port forwarding', icon: 'globe'    as IconName },
        ]}
      />
    </JoinConfigPage>
  )
};

export const SetTheme: React.FunctionComponent<IJoinConfigPageProps> = props => {
  return (
    <JoinConfigPage
      title={'Set theme'}
      description={'These permissions bla bla bla'}
      onContinue={props.onContinue}
      onBack={props.onBack}
    >
      <ToggleCards
        isDark={props.isDark}
        itemsPerCol={2}
        selected={[props.data.settings.app!.applicationTheme!]}
        onChange={selected => {
          console.log(selected)
          props.setData(mergeDeep({...props.data}, {
            settings: {
              app: {
                applicationTheme: selected[0] as 'dark' | 'light',
                monacoTheme: selected[0] === 'dark' ? 'vs-dark' : 'vs'
              }
            }
          }))
        }}
        options={[
          { key: 'dark',   title: 'Dark Theme' },
          { key: 'light',  title: 'Light theme' }
        ]}
      />
    </JoinConfigPage>
  )
};

export const SetUsername: React.FunctionComponent<IJoinConfigPageProps> = props => {
  return (
    <JoinConfigPage
      title={'Set username'}
      description={'These permissions bla bla bla'}
      onContinue={props.onContinue}
      onBack={props.onBack}
    >
      <br />
      <FormGroup
        label="Username"
      >
        <InputGroup
          placeholder="Your username"
          value={props.data.user.name}
          onChange={(e: any) => props.setData(mergeDeep({...props.data}, {
            user: { name: e.target.value }
          }))}
        />
      </FormGroup>
    </JoinConfigPage>
  )
};

export const SetOpenPort: React.FunctionComponent<IJoinConfigPageProps> = props => {
  return (
    <JoinConfigPage
      title={'Make the server available to the public'}
      // description={'These permissions bla bla bla'}
      onContinue={props.onContinue}
      onBack={props.onBack}
    >
      <ToggleCards
        isDark={props.isDark}
        itemsPerCol={2}
        selected={[props.data.openPort ? 'true' : 'false']}
        onChange={selected => {
          props.setData(mergeDeep({...props.data}, {
            openPort: selected.includes('true')
          }))
        }}
        options={[
          {
            key: 'true',
            icon: 'globe-network',
            title: 'Public server',
            description: 'The port on which the devsession server runs on will be opened to public using the' +
              ' localtunnel tool so that other people who have the join URL can join the server. The server can' +
              ' only be joined with the URL, and only the devsession server can be accessed with it.'
          },
          {
            key: 'false',
            icon: 'offline',
            title: 'Local network server',
            description: 'The port will not be opened, only people from within your local network can join the' +
              ' devsession server using your local IP.'
          }
        ]}
      />
    </JoinConfigPage>
  )
};