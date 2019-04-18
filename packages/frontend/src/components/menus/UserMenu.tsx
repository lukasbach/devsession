import * as React from "react";
import {H4, Menu, MenuDivider, MenuItem, Tag} from "@blueprintjs/core";
import {IUserWithLocalData} from "@devsession/common/src/types/users";
import {connect} from "react-redux";
import {IState} from "../../store";
import {getMe} from "../../store/filters";
import {NavigateTo} from "../../store/openFiles";
import {SocketMessages} from "@devsession/common/src/types/communication";
import {OpenPermissionApplicationDialog} from "../../store/permissions";
import {SocketServer} from "../../services/SocketServer";

interface IStateProps {
  users: IUserWithLocalData[];
  canGrantPermissions: boolean;
}
interface IDispatchProps {
  showInCode: (user: IUserWithLocalData) => void;
  navigateToMe: () => void;
  grantPermissions: (users: IUserWithLocalData[]) => void;
  makeAdmin: () => void;
  unmakeAdmin: () => void;
}
interface IOwnProps {
  userIds: string[];
}

export const UsersMenuUI: React.FunctionComponent<IStateProps & IDispatchProps & IOwnProps> = props => {
  const title = props.users.length === 1 ? props.users[0].name : `${props.users.length} users`;

  return (
    <Menu>
      <MenuDivider title={(
        <>
          <H4>{ title }</H4>
        </>
      )} />

      <MenuDivider />

      { props.users.length === 1 && <MenuItem icon={"eye-open"} text={'Show in code'} onClick={() => props.showInCode(props.users[0])} /> }
      <MenuItem icon={"following"} text={`Navigate ${title} to me`} onClick={() => props.navigateToMe()} />

      { props.canGrantPermissions && (
        <>
          <MenuDivider />
          <MenuItem icon={"unlock"} text={'Grant permissions'} onClick={() => props.grantPermissions(props.users)} />
          {
            props.users.length === 1 && !props.users[0].isAdmin &&
            <MenuItem icon={"take-action"} text={'Make admin'} onClick={() => props.makeAdmin()} />
          }
          {
            props.users.length === 1 && props.users[0].isAdmin &&
            <MenuItem icon={"take-action"} text={'Remove admin status'} onClick={() => props.unmakeAdmin()} />
          }
        </>
      )}
    </Menu>
  );
};

export const UsersMenu = connect<IStateProps, IDispatchProps, IOwnProps, IState>((state, ownProps) => ({
  users: state.users.users.filter(u => ownProps.userIds.includes(u.id)),
  canGrantPermissions: getMe(state).isAdmin
}), (dispatch, ownProps) => ({
  showInCode: (user) => dispatch(NavigateTo.create({ position: user.position })),
  navigateToMe: () => SocketServer.emit<SocketMessages.ExternalNavigation.ExternalNavigationRequest>("@@EXTERNALNAV/REQ", {
    userIds: ownProps.userIds
  }),
  grantPermissions: (users) => dispatch(OpenPermissionApplicationDialog.create({
    applicationType: "grant",
    users
  })),
  makeAdmin: () => SocketServer.emit<SocketMessages.Users.UserSetIsAdmin>("@@USERS/SET_IS_ADMIN", {
    user: ownProps.userIds[0],
    isAdmin: true
  }),
  unmakeAdmin: () => SocketServer.emit<SocketMessages.Users.UserSetIsAdmin>("@@USERS/SET_IS_ADMIN", {
    user: ownProps.userIds[0],
    isAdmin: false
  })
}))(UsersMenuUI);
