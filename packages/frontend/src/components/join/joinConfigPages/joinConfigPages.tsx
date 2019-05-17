import * as React from "react";
import {FormGroup, IconName, InputGroup, NonIdealState, Spinner} from "@blueprintjs/core";
import {JoinConfigPage} from "../JoinConfigPage/JoinConfigPage";
import {ToggleCards} from "../../common/ToggleCard/ToggleCards";
import {
  DeepPartial,
  IFileSystemPermission,
  ISettings,
  IUser,
  IUserPermission,
  mergeDeep, SocketMessages
} from "@devsession/common";
import {useEffect, useState} from "react";
import {generatePermission} from "@devsession/common";
import {SocketServer} from "../../../services/SocketServer";

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
      description={'All users that join the devsession will receive these permissions by default upon joining. More' +
      ' fine-tuned permissions can be set on a per-user basis by you and other session admins afterwards.'}
      onContinue={props.onContinue}
      onBack={props.onBack}
    >
      <ToggleCards
        isDark={props.isDark}
        itemsPerCol={1}
        multiple={true}
        selected={selected}
        onChange={setSelected}
        options={[
          {
            key: 'read',
            title: 'Read permission',
            description: 'The user can read all files in the project directory.',
            icon: 'eye-open' as IconName
          },
          {
            key: 'write',
            title: 'Write permission',
            description: 'The user can edit all files in the project directory and can create new files and folders.',
            icon: 'edit' as IconName
          },
          {
            key: 'delete',
            title: 'Delete permission',
            description: 'The user can delete files and folders within the project directory.',
            icon: 'trash' as IconName
          },
          {
            key: 'terminal',
            title: 'Terminal access',
            description: 'The user can create new terminal instances and execute commands from them. Terminal instances ' +
              'are not restricted to the project directory.',
            icon: 'console' as IconName
          },
          {
            key: 'portforwarding',
            title: 'Port forwarding',
            description: 'The user can open up arbitrary ports on the hosting machine.',
            icon: 'globe' as IconName
          },
        ]}
      />
    </JoinConfigPage>
  )
};

export const SetTheme: React.FunctionComponent<IJoinConfigPageProps> = props => {
  return (
    <JoinConfigPage
      title={'Set theme'}
      description={'Set your preferred theme.'}
      onContinue={props.onContinue}
      onBack={props.onBack}
    >
      <ToggleCards
        isDark={props.isDark}
        itemsPerCol={2}
        selected={[props.data.settings.app!.applicationTheme!]}
        onChange={selected => {
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
      description={'Choose a name so that other people in your session know its you.'}
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

export const JoinStep: React.FunctionComponent<
  IJoinConfigPageProps & {setTheme: (theme: 'dark' | 'light') => void}
> = props => {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const adminKey = searchParams.get('adminkey') || undefined;
    const isAdmin = !!adminKey;
    const setupServer = !!(searchParams.get('setupServer'));


    // Initialize user
    SocketServer.emitUnauthorized<SocketMessages.Users.UserInitialized>("@@USERS/INITIALIZE_USER", {
      userdata: props.data.user,
      adminKey
    });

    props.setTheme(props.data.settings.app!.applicationTheme || 'dark');

    SocketServer.once<SocketMessages.Users.UserInitializedResponse>("@@USERS/INITIALIZE_RESPONSE", payload => {
      if (isAdmin && setupServer) {
        SocketServer.emit<SocketMessages.Permissions.SetInitialPermissions>("@@SERVERCONTROL/SETPERM", {
          initialPermissions: props.data.settings.server!.defaultPermissions as IUserPermission[]
        });

        if (props.data.openPort) {
          SocketServer.emit<SocketMessages.PortForwarding.NewConfig>("@@PORTFORWARDING/NEW", {
            config: {
              id: -1,
              addr: location.port,
              title: 'DevSession',
              description: 'This port forwarding setting opens the devsession server up to the public.',
              service: "localtunnel",
              protocol: "http"
            }
          });
        }
      }

      searchParams.delete('adminkey');
      searchParams.delete('setupServer');
      let searchParamsEntries = searchParams.entries();
      let newUrl = new URL(location.href).origin + '/?';

      while (true) {
        const {done, value} = searchParamsEntries.next();
        if (done) break;
        newUrl += `${value[0]}=${value[1]}&`;
      }

      newUrl = newUrl.slice(0, newUrl.length - 1);

      window.history.pushState('DevSession', 'DevSession', newUrl);
    });
  }, []);

  return (
    <JoinConfigPage
      title={'Joining...'}
      onContinue={props.onContinue}
      onBack={props.onBack}
    >
      <br />
      <div style={{ height: '200px' }}>
        <NonIdealState
          title={'Joining the session...'}
          icon={<Spinner />}
        />
      </div>
    </JoinConfigPage>
  )
};
