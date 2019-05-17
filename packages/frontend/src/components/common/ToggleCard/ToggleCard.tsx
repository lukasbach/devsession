import * as React from "react";
import {Card, Intent} from "@blueprintjs/core";
import {useEffect, useState} from "react";
import {getColorsFromIntent} from "@devsession/common";

export const ToggleCard: React.FunctionComponent<{
  isActive?: boolean;
  onChange: (isActive: boolean) => void;
  intent?: Intent;
  isDark?: boolean;
}> = props => {
  const [isActive, setIsActive] = [props.isActive, props.onChange];

  const toggle = () => {
    const oldVal = isActive;
    setIsActive(!oldVal);
  };

  const colors = getColorsFromIntent(props.intent || "none", props.isDark);
  const borderColor = props.intent || "none" === 'none' ? getColorsFromIntent("primary", props.isDark)[2] : colors[0];

  return (
    <Card
      interactive={true}
      onClick={toggle}
      style={{
        backgroundColor: isActive ? colors[2] : undefined,
        borderLeft: isActive ? `8px solid ${borderColor}` : `8px solid transparent`
      }}
    >
      { props.children }
    </Card>
  )
};
