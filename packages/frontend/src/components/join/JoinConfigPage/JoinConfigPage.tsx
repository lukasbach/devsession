import * as React from "react";
import {Alignment, Button, ButtonGroup, Callout, Icon, IconName, Navbar} from "@blueprintjs/core";

export const JoinConfigPage: React.FunctionComponent<{
  title: string;
  icon?: IconName;
  description?: string;
  onContinue?: () => void;
  onBack?: () => void;
}> = props => {

  return (
    <>
      <div className={'bp3-dark'}>
        <Navbar>
          <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>
              { props.icon && <><Icon icon={props.icon}/>&nbsp;</> }
              { props.title }
            </Navbar.Heading>
          </Navbar.Group>
          { props.onContinue && <Navbar.Group align={Alignment.RIGHT}>
            <Button icon="chevron-right" text="Continue" onClick={props.onContinue} minimal />
          </Navbar.Group> }
        </Navbar>
      </div>

      {
        props.description &&
        <Callout intent={"primary"} icon={"info-sign"}>
          { props.description }
        </Callout>
      }

      { props.children }

      <ButtonGroup
        style={{float: 'right'}}
      >
        { props.onBack && <Button
          icon="chevron-left"
          text="Back"
          onClick={props.onBack}
        /> }
        { props.onContinue && <Button
          icon="chevron-right"
          text="Continue"
          intent={"primary"}
          onClick={props.onContinue}
        /> }
      </ButtonGroup>
    </>
  )
};
