import * as React from "react";
import {connect} from "react-redux";
import {IState} from "../../store";
import {UserCard} from "./UserCard";
import {IUserWithLocalData} from "../../types/users";
import {NavigateTo} from "../../store/openFiles";
import {SocketServer} from "../../utils/socket";
import {SocketMessages} from "../../types/communication";
import {getMe} from "../../store/filters";

interface IOwnProps {
}
interface IDispatchProps {
  navigateTo: (user: IUserWithLocalData) => void;
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
  }
}))(UserListUI);
