// import {AppToaster} from "../AppToaster/AppToaster";
import {SettingsDialog} from "../dialogs/SettingsDialog/SettingsDialog";
import {PermissionRequestDialog} from "../dialogs/PermissionRequestDialog/PermissionRequestDialog";
import {PermissionManagementDialog} from "../dialogs/PermissionManagementDialog/PermissionManagementDialog";
import {TerminalDialog} from "../dialogs/TerminalDialog/TerminalDialog";
import {FsActionDialog} from "../dialogs/FsActionDialog/FsActionDialog";
import {PortForwardingManagementDialog} from "../dialogs/PortForwardingManagementDialog/PortForwardingManagementDialog";
import {PermissionApplicationDialog} from "../dialogs/PermissionApplicationDialog/PermissionApplicationDialog";
import {UserErrorDialog} from "../dialogs/UserErrorDialog/UserErrorDialog";
import {ServerErrorDialog} from "../dialogs/ServerErrorDialog/ServerErrorDialog";
import * as React from "react";
import {ExternalNavigationDialog} from "../dialogs/ExternalNavigationDialog/ExternalNavigationDialog";

export const DialogContainer: React.FunctionComponent<{}> = props => (
  <>
    <SettingsDialog />
    <PermissionRequestDialog />
    <PermissionManagementDialog />
    <TerminalDialog />
    <FsActionDialog />
    <PortForwardingManagementDialog />
    <PermissionApplicationDialog />
    <UserErrorDialog />
    <ServerErrorDialog />
    <ExternalNavigationDialog />
  </>
);
