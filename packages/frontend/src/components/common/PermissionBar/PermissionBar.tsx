import * as React from "react";
import {IFileSystemPermission, IUserPermission} from "@devsession/common";
import {IconName} from "@blueprintjs/icons";
import {CalloutBar} from "../CalloutBar/CalloutBar";
import {Intent, Tag} from "@blueprintjs/core";
import {MaybeElement} from "@blueprintjs/core/src/common/props";
import {ThemedContainer} from "../ThemedContainer";


const PermissionBarWrapper: React.FunctionComponent<{
  isDark?: boolean;
  revoke: () => void;
  text: string | JSX.Element;
  icon: IconName;
}> = props => (
  <CalloutBar
    intent={"none"}
    isDark={props.isDark}
    icon={props.icon}
    text={props.text}
    actions={[{
      text: 'Revoke',
      onClick: props.revoke
    }]}
  />
);

export const PermissionBar: React.FunctionComponent<{
  permission: IUserPermission;
  actions?: Array<{
    text: string | JSX.Element;
    onClick?: () => void;
    intent?: Intent;
    icon?: IconName | MaybeElement;
  }>;
}> = props => {
  let component: (isDark: boolean) => JSX.Element;
  
  if (props.permission.type === 'portforwarding') {
     component = isDark => (
      <CalloutBar
        intent={"none"}
        isDark={isDark}
        text={`Port Forwarding`}
        icon={"globe-network"}
        actions={props.actions}
      />
    );
  } else if (props.permission.type === 'terminal') {
    component = isDark => (
      <CalloutBar
        intent={"none"}
        isDark={isDark}
        text={`Terminal access`}
        icon={"console"}
        actions={props.actions}
      />
    );
  } else if (props.permission.type === 'fs') {
    const perm: IFileSystemPermission = props.permission as IFileSystemPermission;
    component = isDark => (
      <CalloutBar
        intent={"none"}
        isDark={isDark}
        actions={props.actions}
        icon={"folder-open"}
        text={(
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <div>{perm.path}</div>
            <div>
              <Tag minimal icon={"eye-on"} rightIcon={perm.mayRead   ? 'tick' : 'cross'}
                   intent={perm.mayRead   ? "success" : "warning"} style={{marginRight: '.3em'}} />
              <Tag minimal icon={"edit"}   rightIcon={perm.mayWrite  ? 'tick' : 'cross'}
                   intent={perm.mayWrite  ? "success" : "warning"} style={{marginRight: '.3em'}} />
              <Tag minimal icon={"trash"}  rightIcon={perm.mayDelete ? 'tick' : 'cross'}
                   intent={perm.mayDelete ? "success" : "warning"} style={{marginRight: '.3em'}} />
            </div>
          </div>
        )}
      />
    );
  } else {
    throw new Error(`${props.permission.type} is no valid permission type.`);
  }

  return (
    <ThemedContainer render={(theme: string) => component(theme === 'dark')} />
  )
};
