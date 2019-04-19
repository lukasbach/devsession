import {connect} from "react-redux";
import {IState} from "../../../store";
import * as React from "react";
import {ThemedContainer} from "../../common/ThemedContainer";
import {Alert, Dialog} from "@blueprintjs/core";
import {useEffect, useState} from "react";
import {SocketMessages} from "@devsession/common";
import {IUser} from "@devsession/common";
import {IUserEditorPosition} from "@devsession/common";
import {NavigateTo} from "../../../store/openFiles";
import {SocketServer} from "../../../services/SocketServer";

interface IStateProps {
  allowExternalNavigation: "always" | "ask" | "never";
}
interface IDispatchProps {
  navigateTo: (position: IUserEditorPosition) => void
}
interface IOwnProps {}

const ExternalNavigationDialogUI: React.FunctionComponent<IStateProps & IDispatchProps & IOwnProps> = props => {
  const [isOpen, setIsOpen] = useState(false);
  const [authoringUser, setAuthoringUser] = useState<IUser | undefined>(undefined);
  const [position, setPosition] = useState<IUserEditorPosition | undefined>(undefined);

  useEffect(() => {
    return SocketServer.on<SocketMessages.ExternalNavigation.ExternalNavigationNotify>("@@EXTERNALNAV/NOTIFY", payload => {
      if (props.allowExternalNavigation === "always") {
        props.navigateTo(payload.position);
      } else if (props.allowExternalNavigation === "ask") {
        setAuthoringUser(payload.authoringUser);
        setPosition(payload.position);
        setIsOpen(true);
      } else if (props.allowExternalNavigation === "never") {
        console.log('Ignored external navigation request.');
      }
    })
  }, [props.allowExternalNavigation]);

  const close = () => {
    setIsOpen(false);
    setAuthoringUser(undefined);
    setPosition(undefined);
  };

  if (!isOpen || !authoringUser || !position || !position.path) {
    return null;
  }

  return (
    <ThemedContainer render={(theme: string, className: string) => (
      <Alert
        className={className}
        isOpen={isOpen}
        onClose={close}
        confirmButtonText={'Navigate to'}
        cancelButtonText={'Cancel'}
        onConfirm={() => props.navigateTo(position)}
      >
        <p>
          The user {authoringUser.name} has requested you to navigate to
          {position.path}{position.selection ? `:${position.selection.startLineNumber}:${position.selection.startColumn}` : ''}.
        </p>
        <p>
          You can change your preferences on how to handle these requests in the app settings.
        </p>
      </Alert>
    )} />
  );
};

export const ExternalNavigationDialog = connect<IStateProps, IDispatchProps, IOwnProps, IState>((state, ownProps) => ({
  allowExternalNavigation: state.settings.app.allowExternalNavigation
}), (dispatch, ownProps) => ({
  navigateTo: (position) => dispatch(NavigateTo.create({ position }))
}))(ExternalNavigationDialogUI);
