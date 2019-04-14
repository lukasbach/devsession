import * as React from "react";
import {useState} from "react";
import {AnchorButton, Button, ButtonGroup, Card, Classes, Elevation, Icon} from "@blueprintjs/core";
import {IUserWithLocalData} from "../../types/users";
import {SocketServer} from "../../utils/socket";
import {SocketMessages} from "../../types/communication";

export const UserCard: React.FunctionComponent<{
  user: IUserWithLocalData;
  navigateTo: () => void;
  requestToNavigateToMe: (userIds: string[]) => void;
}> = props => {
  const [editModel, setEditModel] = useState<IUserWithLocalData | null>(null);

  return (
    <Card
      interactive={true}
      elevation={Elevation.TWO}
      style={{ borderLeft: `8px solid ${props.user.color.primaryColor}`, margin: '.5em' }}
    >
      <h5 className={Classes.HEADING}>
        <a href="#">
          <Icon icon={props.user.isAdmin ? 'take-action' : 'user'}/>&nbsp;
          { props.user.name }
        </a>
      </h5>
      <p className={[Classes.TEXT_SMALL, Classes.TEXT_MUTED, Classes.TEXT_OVERFLOW_ELLIPSIS].join(' ')}>
        {
          props.user.position.path
            ? props.user.position.path
              + (
                props.user.position.cursor
                  ? `:${props.user.position.cursor!.lineNumber}:${props.user.position.cursor!.column}`
                  : ''
              )
            : 'No files open.'
        }
      </p>

      {
        props.user.isItMe
          ? (
            <ButtonGroup>
              <Button icon={'edit'}>Edit my data</Button>
            </ButtonGroup>
          )
          : (
            <ButtonGroup>
              <Button icon={'eye-open'} onClick={props.navigateTo}>Show in code</Button>
              <Button icon={'eye-open'} onClick={() => props.requestToNavigateToMe([props.user.id])}>Navigate to me</Button>
              <AnchorButton rightIcon="caret-down">More</AnchorButton>
            </ButtonGroup>
          )
      }
    </Card>
  )
};