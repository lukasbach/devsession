import * as React from "react";
import {IUserWithLocalData} from "../../store/users";
import {useState} from "react";
import {AnchorButton, Button, ButtonGroup, Card, Classes, Elevation} from "@blueprintjs/core";

export const UserCard: React.FunctionComponent<{
  user: IUserWithLocalData
}> = props => {
  const [editModel, setEditModel] = useState<IUserWithLocalData | null>(null);

  return (
    <Card
      interactive={true}
      elevation={Elevation.TWO}
      style={{ borderLeft: `8px solid ${props.user.color}`, margin: '.5em' }}
    >
      <h5 className={Classes.HEADING}><a href="#">{ props.user.name }</a></h5>
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
              <Button icon={'eye-open'}>Show in code</Button>
              <AnchorButton rightIcon="caret-down">More</AnchorButton>
            </ButtonGroup>
          )
      }
    </Card>
  )
};