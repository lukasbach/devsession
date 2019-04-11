import * as React from "react";
import {connect} from "react-redux";
import {IState} from "../../store";
import {NavigationBar} from "../NavigationBar/NavigationBar";
import {Classes} from "@blueprintjs/core";
import {DialogContainer} from "./DialogContainer";
import {MosaicContainer} from "./MosaicContainer";

interface IDispatchProps {}
interface IStateProps {
  theme: 'dark' | 'light'
}

let AppContainerUI: React.FunctionComponent<IDispatchProps & IStateProps> = props => {
  return (
    <div className={['app-container', props.theme === "dark" ? Classes.DARK : undefined].join(' ')}>
      <DialogContainer />
      <NavigationBar/>
      <MosaicContainer theme={props.theme} />
    </div>
  );
};

export const AppContainer = connect<IStateProps, IDispatchProps, {}, IState>(state => ({
  theme: state.settings.app.applicationTheme
}), dispatch => ({

}))(AppContainerUI);
