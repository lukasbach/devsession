import * as React from "react";
import {connect} from "react-redux";
import {IState} from "../../store";
import {IUserWithLocalData} from "../../store/users";
import {UserCard} from "./UserCard";

interface IOwnProps {
}
interface IDispatchProps {
}
interface IStateProps {
  users: IUserWithLocalData[];
}

let UserListUI: React.FunctionComponent<IDispatchProps & IStateProps> = props => {
  return (
    <div style={{
      overflowY: 'auto',
      height: '100%'
    }}>
      { props.users.map(user => <UserCard user={user} key={user.id} />) }
    </div>
  );
};

export const UserList = connect<IStateProps, IDispatchProps, IOwnProps, IState>((state, ownProps) => ({
  users: state.users.users
}), (dispatch, ownProps) => ({
}))(UserListUI);
