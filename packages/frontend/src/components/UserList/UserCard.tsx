import * as React from "react";
import {
  AnchorButton,
  Button,
  ButtonGroup,
  Card,
  Classes,
  ContextMenuTarget,
  Elevation,
  Icon,
  Popover, ResizeSensor
} from "@blueprintjs/core";
import {IUserWithLocalData} from "../../types/users";
import {UsersMenu} from "../menus/UserMenu";
import {StoreProvider} from "../../index";

@ContextMenuTarget
export class UserCard extends React.Component<{
  user: IUserWithLocalData;
  navigateTo: () => void;
  requestToNavigateToMe: (userIds: string[]) => void;
}, {
  width: number;
}> {
  state = {
    width: 2000
  };

  public render() {
    const showFirstBtn = this.state.width > 200;
    const showSecondBtn = this.state.width > 330;

    console.log(showFirstBtn, showSecondBtn, this.state.width);

    return (
      <div>
        <ResizeSensor onResize={(r) => this.setState({ width: r[0].contentRect.width })}>
          <Card
            elevation={Elevation.TWO}
            style={{ borderLeft: `8px solid ${this.props.user.color.primaryColor}`, margin: '.5em' }}
          >
            <h5 className={Classes.HEADING}>
              <a href="#">
                <Icon icon={this.props.user.isAdmin ? 'take-action' : 'user'}/>&nbsp;
                { this.props.user.name }
              </a>
            </h5>
            <p className={[Classes.TEXT_SMALL, Classes.TEXT_MUTED, Classes.TEXT_OVERFLOW_ELLIPSIS].join(' ')}>
              {
                this.props.user.position.path
                  ? this.props.user.position.path
                  + (
                    this.props.user.position.cursor
                      ? `:${this.props.user.position.cursor!.lineNumber}:${this.props.user.position.cursor!.column}`
                      : ''
                  )
                  : 'No files open.'
              }
            </p>

            {
              this.props.user.isItMe
                ? null
                : (
                  <ButtonGroup>
                    { showFirstBtn && <Button icon={'eye-open'} onClick={this.props.navigateTo}>Show in code</Button> }
                    { showSecondBtn && <Button icon={'eye-open'} onClick={() => this.props.requestToNavigateToMe([this.props.user.id])}>Navigate to me</Button> }
                    <Popover>
                      <AnchorButton rightIcon="caret-down">More</AnchorButton>
                      <UsersMenu userIds={[this.props.user.id]} />
                    </Popover>
                  </ButtonGroup>
                )
            }
          </Card>
        </ResizeSensor>
      </div>
    );
  }

  public renderContextMenu() {
    return (
      <StoreProvider>
        <UsersMenu userIds={[this.props.user.id]} />
      </StoreProvider>
    );
  }
}
