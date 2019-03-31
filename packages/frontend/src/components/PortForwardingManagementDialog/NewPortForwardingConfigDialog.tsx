import * as React from "react";
import {IPortForwardingConfiguration} from "../../types/portforwarding";
import {ThemedContainer} from "../common/ThemedContainer";
import {Button, Classes, Dialog, FormGroup, HTMLSelect, InputGroup} from "@blueprintjs/core";

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
          onClose={props.onClose}
        >

          <div className={Classes.DIALOG_BODY}>
            <FormGroup
              helperText={"Port Forwarding needs a server which acts as an proxy. Currently the two free services " +
              "ngrok and localtunnel are supported."}
              label="Service"
              labelFor="input-service"
            >
              <HTMLSelect
                id="input-service"
                title={'Service'}
                options={["ngrok", "localtunnel"]}
                value={props.config.service}
                onChange={(e: any) => props.onChange({service: e.currentTarget.value})}
              />
            </FormGroup>

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

            {
              props.config.service === "ngrok"
                ? (
                  <>
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
                  </>
                ) : (
                  null
                )
            }
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