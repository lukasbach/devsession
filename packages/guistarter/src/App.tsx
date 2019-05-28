import React, {useState} from 'react';
import './App.css';
import {SettingsForm} from "./SettingsForm";
import {AppContainer} from "./AppContainer";
import {runserver} from "./runserver";
import {Button, ButtonGroup, Callout, H2} from "@blueprintjs/core";

const opn = eval(`require('opn')`);

const App: React.FunctionComponent<{}> = props => {
  const [runningConfig, setRunningConfig] = useState<null | any>(null);

  const joinUrl = runningConfig && `http://localhost:${runningConfig.port}`;
  const adminUrl = runningConfig && `http://localhost:${runningConfig.port}/?adminkey=${runningConfig.adminKey}`;

  const close = () => {
    runningConfig.close();
    setRunningConfig(null);
  };

  return (
    <AppContainer>
      {
        runningConfig
          ? (
            <div>
              <H2>Your session is running!</H2>
              <Callout intent={"primary"}>
                The session is available under <a href={'#'} onClick={() => opn(joinUrl)}>{joinUrl}</a>.
              </Callout>

              <br />

              <div style={{ textAlign: 'right' }}>

                <ButtonGroup>
                  <Button onClick={close}>
                    Close server
                  </Button>

                  <Button onClick={() => opn(joinUrl)}>
                    Join as normal user
                  </Button>

                  <Button onClick={() => opn(adminUrl)} intent={"primary"}>
                    Join as Admin
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          ) : (
            <SettingsForm onComplete={settings => {
              (async () => {
                setRunningConfig(await runserver(settings));
              })();
            }} />
          )
      }
    </AppContainer>
  );
};

export default App;
