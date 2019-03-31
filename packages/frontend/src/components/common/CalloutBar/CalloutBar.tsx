import * as React from "react";
import {Button, Icon, IconName, Intent} from "@blueprintjs/core";
import {getColorsFromIntent} from "../../../utils/colors";
import {MaybeElement} from "@blueprintjs/core/src/common/props";

export const CalloutBar: React.FunctionComponent<{
  intent: Intent;
  icon?: IconName;
  text: string | JSX.Element;
  actions?: Array<{
    text: string;
    onClick?: () => void;
    intent?: Intent;
    icon?: IconName | MaybeElement;
  }>
}> = props => {
  const colors = getColorsFromIntent(props.intent);


  return (
    <div style={{
      backgroundColor: colors[4],
      color: colors[0],
      padding: '1.3em',
      display: 'flex',
      justifyContent: 'space-between'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center'
      }}>
        {
          props.icon
          ? (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <Icon icon={props.icon} style={{ marginRight: '.3em' }}/>
                <div>{ props.text }</div>
              </div>
            )
          : (
            props.text
          )
        }
      </div>

      <div style={{}}>
        {
          props.actions && props.actions.map(action => (
            <Button intent={action.intent || props.intent} icon={action.icon} onClick={action.onClick}>
              { action.text }
            </Button>
          ))
        }
      </div>
    </div>
  );
};
