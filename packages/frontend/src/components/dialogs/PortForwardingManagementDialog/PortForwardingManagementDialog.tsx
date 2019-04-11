import * as React from "react";
import {ThemedContainer} from "../../common/ThemedContainer";
import {
  Drawer,
  Icon
} from "@blueprintjs/core";
import {connect} from "react-redux";
import {IState} from "../../../store";
import {IPortForwardingConfiguration} from "../../../types/portforwarding";
import {ClosePortForwardingManager} from "../../../store/portforwarding";
import {useState} from "react";
import {SocketServer} from "../../../utils/socket";
import {SocketMessages} from "../../../types/communication";
import {CalloutBar} from "../../common/CalloutBar/CalloutBar";
import {hasUserPortForwardingAccess} from "../../../utils/permissions";
import {getMe} from "../../../store/filters";
import {NewPortForwardingDialog} from "./NewPortForwardingConfigDialog";

interface IStateProps {
  configurations: IPortForwardingConfiguration[];
  isOpen: boolean;
  hasPortForwardingPermissions: boolean;
  onRequestPermissions: () => void;
}
interface IDispatchProps {
  onClose: () => void;
}

export const PortForwardingManagementDialogUI: React.FunctionComponent<IStateProps & IDispatchProps> = props => {
  const [isCreationWindowOpen, setIsCreationWindowOpen] = useState(false);
  const [newConfig, setNewConfig] = useState<IPortForwardingConfiguration>({
    id: -1,
    service: 'ngrok',
    addr: 8080,
    title: 'New port forwarding',
    region: 'us',
    protocol: 'http'
  });

  const onCreateNew = () => {
    SocketServer.emit<SocketMessages.PortForwarding.NewConfig>("@@PORTFORWARDING/NEW", {
      config: newConfig
    });
  };

  const onDelete = (configId: number) => {
    SocketServer.emit<SocketMessages.PortForwarding.DeleteConfig>("@@PORTFORWARDING/DELETE", { configId });
  };

  return (
    <ThemedContainer
      render={(theme: string, className: string) =>
        <Drawer
          isOpen={props.isOpen}
          title={'Port Forwarding'}
          onClose={props.onClose}
          canEscapeKeyClose={true}
          canOutsideClickClose={true}
          isCloseButtonShown={true}
          className={className}
        >
          <NewPortForwardingDialog
            isOpen={isCreationWindowOpen}
            config={newConfig}
            onChange={changed => setNewConfig({...newConfig, ...changed})}
            onClose={() => setIsCreationWindowOpen(false)}
            onCreate={onCreateNew}
          />

          <CalloutBar
            intent={"none"}
            isDark={theme === 'dark'}
            text={'The built-in port forwarding service allows you to make applications running on the local machine' +
            ' of the hosting device accessible to the web. You can select an port on which all traffic will be' +
            ' forwarded via a proxy service. The two free-to-use port forwarding services ngrok and localtunnel' +
            ' are supported as proxy services.'}
          />

          {
            props.configurations.map(config => (
              <CalloutBar
                key={config.id}
                intent={"none"}
                isDark={theme === 'dark'}
                text={(
                  <div>
                    {config.protocol.toLocaleUpperCase}&nbsp;
                    {isNaN(config.addr as number) ? 'Port ' + config.addr : config.addr}&nbsp;
                    <Icon icon={"chevron-right"}/>&nbsp;
                    <a href={config.url} target={'_blank'}>{ config.url }</a>&nbsp;
                    (Server {config.region!.toUpperCase})
                  </div>
                )}
                actions={!props.hasPortForwardingPermissions ? [] : [{
                  text: 'Disconnect',
                  icon: 'offline',
                  onClick: () => onDelete(config.id)
                }]}
              />
            ))
          }

          {
            props.hasPortForwardingPermissions
              ? (
                <CalloutBar
                  intent={"primary"}
                  isDark={theme === 'dark'}
                  text={'Create a new port forwarding rule'}
                  actions={[{
                    text: 'Create',
                    icon: 'plus',
                    onClick: () => setIsCreationWindowOpen(true)
                  }]}
                />
              ) : (
                <CalloutBar
                  intent={"warning"}
                  isDark={theme === 'dark'}
                  text={'You do not have sufficient rights to create new port forwarding rules.'}
                  actions={[{
                    text: <>Request&nbsp;permission</>,
                    onClick: props.onRequestPermissions
                  }]}
                />
              )
          }
        </Drawer>
      }/>
  );
};

export const PortForwardingManagementDialog = connect<IStateProps, IDispatchProps, {}, IState>((state, ownProps) => ({
  configurations: state.portForwarding.configurations,
  isOpen: state.portForwarding.isPortForwardingManagerOpen,
  hasPortForwardingPermissions: hasUserPortForwardingAccess(getMe(state), state.permissions.permissions),
  onRequestPermissions: () => {
    SocketServer.emit<SocketMessages.Permissions.RequestPermission>("@@PERM/REQUEST_FROM_BACKEND", {
      permissions: [{
        userid: getMe(state).id,
        permissionId: -1,
        type: "portforwarding"
      }]
    });
  }
}), (dispatch, ownProps) => ({
  onClose: () => dispatch(ClosePortForwardingManager.create({}))
}))(PortForwardingManagementDialogUI);
