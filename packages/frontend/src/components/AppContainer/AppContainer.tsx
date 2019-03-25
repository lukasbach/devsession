import {Mosaic, MosaicWindow} from "react-mosaic-component";
import * as React from "react";
import {MosaicWindowFactory} from "./MosaicWindowFactory";
import {IWindowIdentifiers} from "../../types/mosaic";
import {connect} from "react-redux";
import {IState} from "../../store";
import {NavigationBar} from "../NavigationBar/NavigationBar";
import {Settings} from "../Settings/Settings";
import {Classes} from "@blueprintjs/core";
import {PermissionApplicationDialog} from "../PermissionApplicationDialog/PermissionApplicationDialog";
import {AppToaster} from "../AppToaster/AppToaster";
import {PermissionManagementDialog} from "../PermissionManagementDialog/PermissionManagementDialog";

interface IDispatchProps {}
interface IStateProps {
  theme: 'dark' | 'light'
}

let AppContainerUI: React.FunctionComponent<IDispatchProps & IStateProps> = props => {
  return (
    <div className={['app-container', props.theme === "dark" ? Classes.DARK : undefined].join(' ')}>
      <AppToaster/>
      <Settings />
      <PermissionApplicationDialog />
      <PermissionManagementDialog />
      <NavigationBar/>
      <Mosaic<IWindowIdentifiers>
        className={['mosaic-blueprint-theme', props.theme === "dark" ? Classes.DARK : undefined].join(' ')}
        renderTile={(id, path) => (MosaicWindowFactory(id, path))}
        resize={{ minimumPaneSizePercentage: 5 }}
        initialValue={{
          direction: 'row',
          first: '@@WIN/FILELIST',
          splitPercentage: 20,
          second: {
            direction: 'row',
            first: '@@WIN/CODE',
            second: '@@WIN/USERS',
            splitPercentage: 70,
          }
        }}
      />
    </div>
  );
};

export const AppContainer = connect<IStateProps, IDispatchProps, {}, IState>(state => ({
  theme: state.settings.app.applicationTheme
}), dispatch => ({

}))(AppContainerUI);
