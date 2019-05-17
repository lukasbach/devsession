import * as React from "react";
import {ToggleCardContainer} from "./ToggleCardContainer";
import {H5, Icon, IconName, Intent} from "@blueprintjs/core";
import {ToggleCard} from "./ToggleCard";
import {useEffect, useState} from "react";

export const ToggleCards: React.FunctionComponent<{
  isDark?: boolean;
  options: Array<{
    key: string;
    title: string;
    description?: string;
    icon?: IconName,
    intent?: Intent
  }>;
  onChange: (selected: string[]) => void;
  itemsPerCol?: number;
  multiple?: boolean;
  selected?: string[];
}> = props => {
  const [selected, setSelected] = [props.selected || [], props.onChange];

  const itemsPerCol = props.itemsPerCol || 2;
  const cols = Math.ceil(props.options.length / (itemsPerCol));

  return (
    <>
      { '.'.repeat(cols).split('').map((_, i) => (
        <ToggleCardContainer key={i}>
          {
            props.options.filter((el, j) => j >= i * itemsPerCol && j < (i + 1) * itemsPerCol).map((el) => (
              <ToggleCard
                key={el.key}
                onChange={isActive => {
                  if (isActive) {
                    setSelected(selected.filter(e => el.key !== e));
                  } else {
                    setSelected(props.multiple ? [...selected, el.key] : [el.key]);
                  }
                }}
                intent={el.intent}
                isActive={!!selected.find(e => el.key === e)}
                isDark={props.isDark}
              >
                <H5>
                  { el.icon && <Icon icon={el.icon}/> }
                  &nbsp;
                  { el.title }
                </H5>
                { el.description && <p>{ el.description }</p> }
              </ToggleCard>
            ))
          }
        </ToggleCardContainer>
      ))}
    </>
  )
};
