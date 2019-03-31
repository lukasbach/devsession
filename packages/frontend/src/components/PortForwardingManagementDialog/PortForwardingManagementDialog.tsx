import * as React from "react";
import {ThemedContainer} from "../common/ThemedContainer";
import {Drawer, Button, NonIdealState, Dialog, Classes, FormGroup, InputGroup, HTMLSelect} from "@blueprintjs/core";
import {connect} from "react-redux";
import {IState} from "../../store";
import {IPortForwardingConfiguration} from "../../types/portforwarding";
import {ClosePortForwardingManager} from "../../store/portforwarding";
import {useState} from "react";
import {SocketServer} from "../../utils/socket";
import {SocketMessages} from "../../types/communication";

interface IStateProps {
  configurations: IPortForwardingConfiguration[];
  isOpen: boolean;
  hasPortForwardingPermissions: boolean;
}
interface IDispatchProps {
  onClose: () => void;
}

export const NewPortForwardingDialog: React.FunctionComponent<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  config: IPortForwardingConfiguration;
  onChange: (config: Partial<IPortForwardingConfiguration>) => void;
}> = props => {
  return (
    <ThemedContainer
      render={(theme: string, className: string) =>
        <Dialog
          isOpen={props.isOpen}
          title={'New Portforwarding Configuration'}
          className={className}
        >

          <div className={Classes.DIALOG_BODY}>
            <FormGroup
              helperText=""
              label="Adress or Port"
              labelFor="input-addr"
            >
              <InputGroup
                id="input-addr"
                placeholder="Adress or port"
                value={'' + props.config.addr}
                onChange={(e: any) => {
                  props.onChange({addr: isNaN(e.target.value) ? e.target.value : parseInt(e.target.value)})
                }}
              />
            </FormGroup>


            <FormGroup
              helperText=""
              label="Name of the configuration"
              labelFor="input-title"
            >
              <InputGroup
                id="input-title"
                placeholder="Name of the configuration"
                value={'' + props.config.title}
                onChange={(e: any) => props.onChange({title: e.target.value})}
              />
            </FormGroup>

            <FormGroup
              helperText="Where the proxy is hosted. US by default."
              label="Region"
              labelFor="input-region"
            >
              <HTMLSelect
                id="input-region"
                title={'Region'}
                options={["us", "eu", "au", "ap"]}
                value={props.config.region}
                onChange={(e: any) => props.onChange({region: e.currentTarget.value})}
              />
            </FormGroup>

            <FormGroup
              helperText="The forwarded protocol, HTTP by default."
              label="Protocol"
              labelFor="input-protocol"
            >
              <HTMLSelect
                id="input-protocol"
                title={'Protocol'}
                options={["HTTP", "TCP", "TLS"]}
                value={props.config.protocol}
                onChange={(e: any) => props.onChange({protocol: e.currentTarget.value})}
              />
            </FormGroup>
          </div>

          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button intent={"none"} onClick={() => {
                props.onClose();
              }}>
                Cancel
              </Button>

              <Button intent={"primary"} onClick={() => {
                props.onCreate();
                props.onClose();
              }}>
                Create
              </Button>
            </div>
          </div>
        </Dialog>
    } />
  )
};

export const PortForwardingManagementDialogUI: React.FunctionComponent<IStateProps & IDispatchProps> = props => {
  const [isCreationWindowOpen, setIsCreationWindowOpen] = useState(false);
  const [newConfig, setNewConfig] = useState<IPortForwardingConfiguration>({
    id: -1,
    addr: 8080,
    title: 'New port forwarding',
    region: 'us',
    protocol: 'http'
  });

  const onCreateNew = () => {
    SocketServer.emit<SocketMessages.PortForwarding.NewConfig>("@@PORTFORWARDING/NEW", {
      config: newConfig
    })
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
          <Button onClick={() => setIsCreationWindowOpen(true)}>New</Button>

          {
            JSON.stringify(props.configurations)
          }

          <NewPortForwardingDialog
            isOpen={isCreationWindowOpen}
            config={newConfig}
            onChange={changed => setNewConfig({...newConfig, ...changed})}
            onClose={() => setIsCreationWindowOpen(false)}
            onCreate={onCreateNew}
          />
        </Drawer>
      }/>
  );
};

export const PortForwardingManagementDialog = connect<IStateProps, IDispatchProps, {}, IState>((state, ownProps) => ({
  configurations: state.portForwarding.configurations,
  isOpen: state.portForwarding.isPortForwardingManagerOpen,
  hasPortForwardingPermissions: true,
}), (dispatch, ownProps) => ({
  onClose: () => dispatch(ClosePortForwardingManager.create({}))
}))(PortForwardingManagementDialogUI);
