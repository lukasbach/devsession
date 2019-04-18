import * as React from "react";
import {Button, Icon, IconName, Intent} from "@blueprintjs/core";
import {getColorsFromIntent} from "@devsession/common/src/utils/colors";
import {MaybeElement} from "@blueprintjs/core/src/common/props";
import {ThemedContainer} from "../ThemedContainer";

export const CalloutBar: React.FunctionComponent<{
  intent?: Intent;
  icon?: IconName;
  text: string | JSX.Element;
  isDark?: boolean;
  actions?: Array<{
    text: string | JSX.Element;
    onClick?: () => void;
    intent?: Intent;
    icon?: IconName | MaybeElement;
  }>
}> = props => {
  const intent = props.intent || 'none' as Intent;

  return <ThemedContainer render={(theme: string) => {
    const colors = getColorsFromIntent(intent, theme === 'dark');
    return (
      <div style={{
        backgroundColor: colors[4],
        color: intent !== "none" ? colors[0] : undefined,
        padding: '1.3em',
        display: 'flex',
        alignItems: 'stretch',
        borderBottom: '1px solid ' + colors[3]
      }}>
        <div style={{
          flexGrow: 2,
          display: 'flex',
          alignItems: 'center',
          width: '100%'
        }}>
          {
            props.icon
              ? (
                <div style={{
                  display: 'flex',
                  width: '100%'
                }}>
                  <Icon icon={props.icon} style={{ marginRight: '.3em' }}/>
                  <div style={{
                    flexGrow: 2
                  }}>
                    { props.text }
                  </div>
                </div>
              )
              : (
                props.text
              )
          }
        </div>

        <div style={{
          marginLeft: '.5em'
        }}>
          {
            props.actions && props.actions.map((action, i) => (
              <Button
                intent={action.intent || intent}
                icon={action.icon}
                onClick={action.onClick}
                key={i}
              >
                { action.text }
              </Button>
            ))
          }
        </div>
      </div>
    );
  }} />;
};
