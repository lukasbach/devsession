import * as React from "react";
import {connect} from "react-redux";
import {IState} from "../../store";
import {UserCard} from "./UserCard";
import {IUserWithLocalData} from "@devsession/common";
import {NavigateTo} from "../../store/openFiles";
import {SocketMessages} from "@devsession/common";
import {getMe} from "../../store/filters";
import {CalloutBar} from "../common/CalloutBar/CalloutBar";
import {SocketServer} from "../../services/SocketServer";

interface IOwnProps {
}
interface IDispatchProps {
  navigateTo: (user: IUserWithLocalData) => void;
  navigateAllToMe: () => void;
}
interface IStateProps {
  users: IUserWithLocalData[];
  me: IUserWithLocalData;
}

let UserListUI: React.FunctionComponent<IDispatchProps & IStateProps> = props => {
  const requestToNavigateToMe = (userIds: string[]) => {
    SocketServer.emit<SocketMessages.ExternalNavigation.ExternalNavigationRequest>("@@EXTERNALNAV/REQ", {
      userIds: userIds,
      position: props.me.position
    })
  };

  return (
    <div style={{
      overflowY: 'auto',
      height: '100%'
    }}>
      <CalloutBar
        text={''}
        actions={[{
          text: <span>Navigate&nbsp;everyone&nbsp;to&nbsp;me</span>,
          onClick: props.navigateAllToMe
        }]}
      />
      {
        props.users.map(user => (
          <UserCard
            key={user.id}
            user={user}
            navigateTo={() => props.navigateTo(user)}
            requestToNavigateToMe={requestToNavigateToMe}
          />
        ))
      }
    </div>
  );
};

export const UserList = connect<IStateProps, IDispatchProps, IOwnProps, IState>((state, ownProps) => ({
  users: state.users.users,
  me: getMe(state)
}), (dispatch, ownProps) => ({
  navigateTo: (user) => {
    dispatch(NavigateTo.create({ position: user.position }));
  },
  navigateAllToMe: () => {
    SocketServer.emit<SocketMessages.ExternalNavigation.ExternalNavigationRequest>("@@EXTERNALNAV/REQ", {})
  }
}))(UserListUI);
