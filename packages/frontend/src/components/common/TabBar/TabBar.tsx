import * as React from "react";
import {Button, Icon, IconName} from "@blueprintjs/core";
import {MaybeElement} from "@blueprintjs/core/src/common/props";

import "./tabs.css";

const Tab: React.FunctionComponent<{
  id: string | number;
  text: string | number;
  icon?: IconName | MaybeElement;
  canClose: boolean;
  active: boolean;
  onClose: () => void;
  onClick: () => void;
}> = props => (
  <div className={['tabbar-tab', props.active && 'active'].join(' ')} onClick={props.onClick}>
    { props.text }
    {
      props.icon &&
      <Icon icon={props.icon} />
    }
    {
      props.canClose &&
      <Button
          icon={'cross'}
          onClick={(e: any) => {
            e.stopPropagation();
            props.onClose();
          }}
          minimal small />
    }
  </div>
);

export const TabBar: React.FunctionComponent<{
  values: Array<{
    id: string | number;
    text: string;
    canClose: boolean;
  }>
  activeValue: string | number | null;
  onClose?: (id: string | number) => void;
  onChange: (id: string | number | null) => void;
  onAdd?: () => void;
}> = props => {

  return (
    <div className={'tabbar'}>
      {
        props.values.map(v => (
          <Tab
            key={v.id}
            id={v.id}
            text={v.text}
            active={v.id === props.activeValue}
            canClose={v.canClose}
            onClick={() => props.onChange(v.id)}
            onClose={() => v.canClose && props.onClose ? props.onClose(v.id) : () => null}
          />
        ))
      }
      {
        props.onAdd &&
        <Tab
            id={'__newitem'}
            text={'Add'}
            icon={'plus'}
            active={false}
            canClose={false}
            onClick={() => props.onAdd!()}
            onClose={() => null}
        />
      }
    </div>
  )
}
