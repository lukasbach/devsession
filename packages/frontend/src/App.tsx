import React, {Component, useEffect, useState} from "react";
import {AppContainer} from "./components/AppContainer/AppContainer";
import {connect} from "react-redux";
import {IState} from "./store";
import {JoinContainer} from "./components/join/JoinContainer/JoinContainer";
import {SocketServer} from "./services/SocketServer";
import {SocketMessages} from "@devsession/common";
import {NonIdealState} from "@blueprintjs/core";

interface IStateProps {
  isJoinComplete: boolean;
}
interface IDispatchProps {}

const AppUI: React.FunctionComponent<IStateProps & IDispatchProps> = props => {
  const [isConnected, setIsConnected] = useState(true);
  useEffect(() => {
    const unregisterOnDisconnect = SocketServer.onDisconnect(() => setIsConnected(false));
    const unregisterOnReconnect = SocketServer.onReconnect(() => setIsConnected(true));

    return () => {
      unregisterOnDisconnect();
      unregisterOnReconnect();
    }
  }, []);

  useEffect(() => {
    if (props.isJoinComplete) {
      SocketServer.emit<SocketMessages.PortForwarding.RequestNotifications>("@@PORTFORWARDING/REQ", {});
    }
  }, [props.isJoinComplete]);

  if (!isConnected) {
    return (
      <NonIdealState
        icon={'offline'}
        title={'Not connected to devsession server'}
        description={'It looks like the connection to the devsession server was lost. Maybe the server is not running ' +
        'anymore?'}
      />
    )
  }

  if (props.isJoinComplete) {
    return <AppContainer/>;
  } else {
    return <JoinContainer/>;
  }
};

export const App = connect<IStateProps, IDispatchProps, {}, IState>(
  (state) => ({
    isJoinComplete: state.users.users.length > 0
  }),
  () => ({})
)(AppUI);