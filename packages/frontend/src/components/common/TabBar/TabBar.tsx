import * as React from "react";
import {Button, Icon, IconName, Menu, MenuItem, Popover} from "@blueprintjs/core";
import {MaybeElement} from "@blueprintjs/core/src/common/props";

import "./tabs.css";
import {OverflowContainer} from "../OverflowContainer/OverflowContainer";
import {ReactNode, useState} from "react";
import {SocketServer} from "../../../services/SocketServer";
import {SocketMessages} from "@devsession/common";

const Tab: React.FunctionComponent<{
  id: string | number;
  text: string | number;
  icon?: IconName | MaybeElement;
  canClose: boolean;
  active: boolean;
  onClose: () => void;
  onClick: () => void;
}> = props => (
  <div
    className={['tabbar-tab', props.active && 'active'].join(' ')}
    onClick={props.onClick}
    style={!props.canClose ? {paddingRight: '1em'} : {}}
  >
    {
      props.icon &&
      <Icon icon={props.icon} />
    }
    <div className={'bp3-text-overflow-ellipsis tabbar-tab-text'}>
      { props.text }
    </div>
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
  actions?: ReactNode[];
}> = props => {
  const [overflownItems, setOverflownItems] = useState<React.ReactNode[]>([]);
  const [showAll, setShowAll] = useState(false);

  const addTab = (
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
  );

  return (
    <div className={'tabbar'}>
      <OverflowContainer
        elements={
          [
          ...props.values.map(v => (
              <Tab
                key={v.id}
                id={v.id}
                text={v.text}
                active={v.id === props.activeValue}
                canClose={v.canClose}
                onClick={() => props.onChange(v.id)}
                onClose={() => v.canClose && props.onClose ? props.onClose(v.id) : () => null}
              />
            )),
            addTab
          ]
        }
        renderOverflowElements={setOverflownItems}
        showAll={showAll}
      />

      { (props.actions || []).map((a, i) => <React.Fragment key={i}>{a}</React.Fragment>) }

      <Button
        icon={showAll ? "chevron-up" : "chevron-down"}
        onClick={() => setShowAll(!showAll)}
        active={showAll}
        minimal
        small
      />
    </div>
  )
};
