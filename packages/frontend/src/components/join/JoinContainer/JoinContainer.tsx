import * as React from "react";
import {connect} from "react-redux";
import {IState} from "../../../store";
import {DeepPartial, IUser, SocketMessages, generatePermission} from "@devsession/common";
import {SocketServer} from "../../../services/SocketServer";
import {Alignment, H3, Navbar, Colors, Callout, Icon, Button} from "@blueprintjs/core";
import {useState} from "react";
import {
  IJoinConfig,
  SelectDefaultPermissions, SetOpenPort,
  SetTheme,
  SetUsername
} from "../joinConfigPages/joinConfigPages";

import "./style.css";

interface IStateProps {
}
interface IDispatchProps {
  join: (userdata: DeepPartial<IUser>) => void;
}

const useSteps = (initialSteps: string[]): [string, boolean, () => void, () => void] => {
  const steps = initialSteps;
  const [currentStep, setCurrentStep] = useState(0);
  const nextStep = () => setCurrentStep(currentStep < steps.length ? currentStep + 1 : currentStep);
  const prevStep = () => setCurrentStep(currentStep > 0 ? currentStep - 1 : currentStep);
  const isFinished = currentStep >= steps.length;
  console.log(currentStep);
  return [steps[currentStep % steps.length], isFinished, nextStep, prevStep];
};

export const JoinContainerUI: React.FunctionComponent<IStateProps & IDispatchProps> = props => {
  const [currentStep, isFinished, nextStep, prevStep] =
    useSteps(['permissions', 'theme', 'username', 'openport', 'join']);
  const [data, setData] = useState<IJoinConfig>({
    settings: {
      app: {
        monacoTheme: 'vs',
        applicationTheme: 'light'
      },
      server: {
        defaultPermissions: [
          generatePermission.fs(true, true, false, 'root')
        ]
      }
    },
    user: {
      name: 'New user'
    },
    openPort: true
  });

  const isDark = data.settings.app!.applicationTheme === 'dark';

  return (
    <div
      className={['joincontainer', isDark ? 'bp3-dark' : ''].join(' ')}
      style={{ backgroundColor: isDark ? Colors.DARK_GRAY2 : Colors.LIGHT_GRAY2 }}
    >
      {
        (() => {
          switch (currentStep) {
            case 'permissions':
              return (
                <SelectDefaultPermissions
                  data={data}
                  setData={setData}
                  onContinue={nextStep}
                  isDark={isDark}
                />
              );

            case 'theme':
              return (
                <SetTheme
                  data={data}
                  setData={setData}
                  onContinue={nextStep}
                  onBack={prevStep}
                  isDark={isDark}
                />
              );

            case 'username':
              return (
                <SetUsername
                  data={data}
                  setData={setData}
                  onContinue={nextStep}
                  onBack={prevStep}
                  isDark={isDark}
                />
              );

            case 'openport':
              return (
                <SetOpenPort
                  data={data}
                  setData={setData}
                  onContinue={nextStep}
                  onBack={prevStep}
                  isDark={isDark}
                />
              );

            case 'join':
              return "joining..";
          }
        })()
      }
    </div>
  )
};

export const JoinContainer = connect<IStateProps, IDispatchProps, {}, IState>(
  (state) => ({
  }),
  (dispatch) => ({
    join: (userdata) => {
      SocketServer.emitUnauthorized<SocketMessages.Users.UserInitialized>("@@USERS/INITIALIZE_USER", {
        adminKey: new URLSearchParams(window.location.search).get('adminkey') || undefined,
        userdata
      });
    }
  })
)(JoinContainerUI);