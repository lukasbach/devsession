import React, {Component, useEffect} from "react";
import {AppContainer} from "./components/AppContainer/AppContainer";
import {connect} from "react-redux";
import {IState} from "./store";
import {JoinContainer} from "./components/join/JoinContainer/JoinContainer";
import {SocketServer} from "./services/SocketServer";
import {SocketMessages} from "@devsession/common";

interface IStateProps {
  isJoinComplete: boolean;
}
interface IDispatchProps {}

const AppUI: React.FunctionComponent<IStateProps & IDispatchProps> = props => {
  useEffect(() => {
    if (props.isJoinComplete) {
      SocketServer.emit<SocketMessages.PortForwarding.RequestNotifications>("@@PORTFORWARDING/REQ", {});
    }
  }, [props.isJoinComplete]);

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