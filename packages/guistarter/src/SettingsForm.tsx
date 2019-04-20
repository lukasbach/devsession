import React, {useState} from "react";
import {Button, ControlGroup, FormGroup, InputGroup} from "@blueprintjs/core";
const {dialog} = eval(`require('electron').remote`); // Prevent webpack from resolving

const DirectoryInput: React.FunctionComponent<{
  path?: string;
  setPath: (path: string) => void;
}> = props => {
  const openDialog = () => {
    const result = dialog.showOpenDialog(
      {
        title: 'Project directory',
        buttonLabel: 'Select project directory',
        properties: ['openDirectory']
      }
    );

    if (result && result[0]) {
      props.setPath(result[0]);
    }
  };

  return (
    <FormGroup
      helperText="This will be the root directory for the project on which the session will be hosted."
      label="Project directory"
    >
      <ControlGroup style={{ flexGrow: 1 }} fill>
        <InputGroup
          placeholder="Click to browse for directory"
          style={{ flexGrow: 1 }}
          value={props.path}
          onChange={(e: any) => props.setPath(e.currentTarget.value)}
          onClick={() => !props.path ? openDialog() : null}
        />

        <Button icon="folder-open" style={{ flexGrow: 0 }} onClick={openDialog} />
      </ControlGroup>
    </FormGroup>
  )
};

export const SettingsForm: React.FunctionComponent<{
  onComplete: (settings: object) => void;
}> = props => {
  const [settings, setSettings] = useState<{
    projectPath?: string;
    port?: number;
    adminKey?: string;
  }>({
    port: 8020
  });

  const override = (key: string) => (value: any) => setSettings({...settings, [key]: value});
  const onChangeHandler = (handler: (value: any) => void, parse?: boolean) => (e: any) =>
    handler(parse ? e.currentTarget.value : parseInt(e.currentTarget.value));

  return (
    <div>
      <DirectoryInput path={settings.projectPath} setPath={override('projectPath')}/>

      <FormGroup
        helperText="The port on which DevSession is going to open the server."
        label="Port"
      >
        <InputGroup type={'number'} placeholder="Port" value={'' + settings.port} onChange={onChangeHandler(override('port'))} />
      </FormGroup>

      <div
        style={{
          textAlign: 'right'
        }}
      >
        {
          !settings.projectPath ? 'You have to specify a project directory' : null
        }
        &nbsp;&nbsp;

        <Button
          intent={"primary"}
          icon={"chevron-right"}
          onClick={() => props.onComplete(settings)}
          disabled={!settings.projectPath}
        >
          Create session
        </Button>
      </div>
    </div>
  )
};