import * as React from "react";
import {Mosaic} from "react-mosaic-component";
import {IWindowIdentifiers} from "../../types/mosaic";
import {Classes} from "@blueprintjs/core";
import {MosaicWindowFactory} from "./MosaicWindowFactory";

export const MosaicContainer: React.FunctionComponent<{
  theme: 'dark' | 'light'
}> = props => (
  <Mosaic<IWindowIdentifiers>
    className={['mosaic-blueprint-theme', props.theme === "dark" ? Classes.DARK : undefined].join(' ')}
    renderTile={(id, path) => (MosaicWindowFactory(id, path))}
    resize={{ minimumPaneSizePercentage: 5 }}
    initialValue={{
      direction: 'row',
      first: '@@WIN/FILELIST',
      splitPercentage: 20,
      second: {
        direction: 'row',
        first: '@@WIN/CODE',
        second: '@@WIN/USERS',
        splitPercentage: 70,
      }
    }}
  />
);