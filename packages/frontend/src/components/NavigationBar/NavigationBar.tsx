import * as React from "react";
import {Alignment, Button, Classes, Navbar} from "@blueprintjs/core";
import {connect} from "react-redux";
import {IState} from "../../store";
import {ApplySettings, OpenSettings} from "../../store/settings";
import {OpenPermissionApplicationDialog, SetPermissionManagerState} from "../../store/permissions";
import {getMe} from "../../store/filters";
import {OpenTerminalManager} from "../../store/terminal";
import {OpenPortForwardingManager} from "../../store/portforwarding";
import {SetServerErrorDialogState} from "../../store/errorhandling";

import "./style.css";
import {useState} from "react";
import {AboutDialog} from "../dialogs/AboutDialog/AboutDialog";

interface IStateProps {
  shouldDisplayPermissionManagerButton: boolean;
  shouldDisplayServerErrorDialogButton: boolean;
}

interface IDispatchProps {
  openSettings: () => void;
  openPermissionManager: () => void;
  openPermissionApplicationDialog: () => void;
  openTerminalManager: () => void;
  openPortForwardingManager: () => void;
  openServerErrorDialog: () => void;
}

interface IOwnProps {}

const NavigationBarUI: React.FunctionComponent<IStateProps & IDispatchProps> = props => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div>
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>DevSession</Navbar.Heading>

          <Navbar.Divider />

          <Button className="bp3-minimal" icon="console" text="Terminals" onClick={props.openTerminalManager} />
          <Button className="bp3-minimal" icon="globe-network" text="Port Forwarding" onClick={props.openPortForwardingManager} />
          <Button className="bp3-minimal" icon="settings" text="Settings" onClick={props.openSettings} />
          {
            props.shouldDisplayPermissionManagerButton
              ? <Button className="bp3-minimal" icon="helper-management" text="Permissions" onClick={props.openPermissionManager} />
              : <Button className="bp3-minimal" icon="helper-management" text="Permissions" onClick={props.openPermissionApplicationDialog} />
          }
          {
            props.shouldDisplayServerErrorDialogButton
              ? <Button className="bp3-minimal" icon="error" text="Server Errors" onClick={props.openServerErrorDialog} />
              : null
          }
          <Button className="bp3-minimal" icon="help" text="About" onClick={() => setIsAboutOpen(true)} />
        </Navbar.Group>
      </Navbar>

      {/*<Navbar className={['subnav', Classes.SMALL].join(' ')}>
        <Navbar.Group align={Alignment.LEFT}>
          <Button className="bp3-minimal" icon="home" text="Home" />
          <Button className="bp3-minimal" icon="document" text="Files" />
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Button className="bp3-minimal" icon="play" />
          <Button className="bp3-minimal" icon="stop" />
          <Button className="bp3-minimal" icon="lightbulb" />
        </Navbar.Group>
      </Navbar>*/}

      <AboutDialog isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)}/>
    </div>
  );
};

export const NavigationBar = connect<IStateProps, IDispatchProps, IOwnProps, IState>((state, ownProps) => ({
  shouldDisplayPermissionManagerButton: getMe(state).isAdmin,
  shouldDisplayServerErrorDialogButton: getMe(state).isAdmin && state.errorHandling.serverErrors.length > 0
}), (dispatch, ownProps) => ({
  openSettings: () => dispatch(OpenSettings.create({})),
  openPermissionManager: () => dispatch(SetPermissionManagerState.create({ open: true, currentUser: undefined })),
  openPermissionApplicationDialog: () => dispatch(OpenPermissionApplicationDialog.create({applicationType: 'request'})),
  openTerminalManager: () => dispatch(OpenTerminalManager.create({})),
  openPortForwardingManager: () => dispatch(OpenPortForwardingManager.create({})),
  openServerErrorDialog: () => dispatch(SetServerErrorDialogState.create({ isOpen: true }))
}))(NavigationBarUI);
