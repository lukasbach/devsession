import {MultiSelect, Select} from "@blueprintjs/select";
import {IUser, IUserWithLocalData} from "@devsession/common";
import * as React from "react";
import {Button, Icon, MenuItem, Tag} from "@blueprintjs/core";
import {connect} from "react-redux";
import {IState} from "../../../store";
import {useEffect, useState} from "react";

import "./style.css";

interface IOwnProps<MULTIPLE extends boolean> {
  onSelect?: (users: MULTIPLE extends true ? IUserWithLocalData[] : [IUserWithLocalData]) => void;
  fill?: boolean;
  multiple?: MULTIPLE;
}
interface IStateProps<MULTIPLE extends boolean> extends IOwnProps<MULTIPLE> {
  users: MULTIPLE extends true ? IUserWithLocalData[] : [IUserWithLocalData];
}
interface IDispatchProps {}

const UserSelectionUI: React.FunctionComponent<IStateProps<any> & IDispatchProps> = (props) => {
  const [selectedUsers, setSelectedUsers] = useState<IUserWithLocalData[]>([]);

  useEffect(() => {
    if (props.onSelect) {
      props.onSelect(selectedUsers);
    }
  }, [selectedUsers]);

  const onSelect = (user: IUserWithLocalData) => {
    const alreadySelected = !!selectedUsers.find(u => u.id === user.id);

    if (props.multiple) {
      if (alreadySelected) {
        setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    } else if (!alreadySelected) {
      setSelectedUsers([user]);
    }
  };

  const UserSelectComponent = props.multiple ? MultiSelect.ofType<IUserWithLocalData>() :  Select.ofType<IUserWithLocalData>();

  return (
    <UserSelectComponent
      className={['userselection-component', props.fill ? 'fill' : undefined].join(' ')}
      items={props.users}
      itemPredicate={(query, user) => user.name.includes(query)}
      itemRenderer={(user, query) => (
        <MenuItem
          text={user.name}
          onClick={() => onSelect(user)}
          icon={<Icon icon={user.isItMe ? 'mugshot' : user.isAdmin ? 'star' : 'person'} color={user.color.primaryColor}/>}
        />
      )}
      tagRenderer={user => user.name}
      onItemSelect={onSelect}
      tagInputProps={{
        onRemove: (tag, index) => setSelectedUsers(selectedUsers.filter((u, i) => i !== index)),
        fill: props.fill,
        tagProps: {
          minimal: true
        }
      }}
      noResults={<MenuItem disabled={true} text="No results." />}
      selectedItems={selectedUsers}
    >
      {/* children become the popover target; render value here */}
      { !props.multiple && <Button text={selectedUsers[0] ? selectedUsers[0].name : 'Select a user...'} rightIcon="double-caret-vertical" /> }
    </UserSelectComponent>
  )
};

export const UserSelection = connect<IStateProps<any>, IDispatchProps, IOwnProps<any>, IState>((state, ownProps) => ({
  users: state.users.users,
  ...ownProps
}), (dispatch, ownProps) => ({
}))(UserSelectionUI);
