import {Select} from "@blueprintjs/select";
import {IUser, IUserWithLocalData} from "../../../types/users";
import * as React from "react";
import {Button, Icon, MenuItem} from "@blueprintjs/core";
import {connect} from "react-redux";
import {IState} from "../../../store";
import {useState} from "react";

const UserSelectComponent = Select.ofType<IUserWithLocalData>();

interface IOwnProps {
  onSelect?: (user: IUserWithLocalData | null) => void;
}
interface IStateProps extends IOwnProps {
  users: IUserWithLocalData[]
}
interface IDispatchProps {}

const UserSelectionUI: React.FunctionComponent<IStateProps & IDispatchProps> = props => {
  const [selectedUser, setSelectedUser] = useState<IUserWithLocalData | null>(null);

  const onSelect = (user: IUserWithLocalData) => {
    console.log(user);
    setSelectedUser(user);
    if (props.onSelect) {
      props.onSelect(user);
    }
  };

  return (
    <UserSelectComponent
      items={props.users}
      itemPredicate={(query, user) => user.name.includes(query)}
      itemRenderer={(user, query) => (
        <MenuItem
          text={user.name}
          onClick={() => onSelect(user)}
          icon={<Icon icon={user.isItMe ? 'mugshot' : user.isAdmin ? 'star' : 'person'} color={user.color.primaryColor}/>}
        />
      )}
      onItemSelect={onSelect}
      noResults={<MenuItem disabled={true} text="No results." />}
    >
      {/* children become the popover target; render value here */}
      <Button text={selectedUser ? selectedUser.name : 'Select a user...'} rightIcon="double-caret-vertical" />
    </UserSelectComponent>
  )
};

export const UserSelection = connect<IStateProps, IDispatchProps, IOwnProps, IState>((state, ownProps) => ({
  users: state.users.users,
  ...ownProps
}), (dispatch, ownProps) => ({
}))(UserSelectionUI);
