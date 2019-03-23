import {Mosaic, MosaicWindow} from "react-mosaic-component";
import * as React from "react";
import {MosaicWindowFactory} from "./MosaicWindowFactory";
import {IWindowIdentifiers} from "../../types/mosaic";
import {connect} from "react-redux";
import {IState} from "../../store";

interface IDispatchProps {}
interface IStateProps {}

let AppContainerUI: React.FunctionComponent<IDispatchProps & IStateProps> = props => {
  return (
    <div>
      <Mosaic<IWindowIdentifiers>
        className={'mosaic-blueprint-theme'}
        renderTile={(id, path) => (MosaicWindowFactory(id, path))}
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
    </div>
  );
};

export const AppContainer = connect<IStateProps, IDispatchProps, {}, IState>(initialState => ({

}), dispatch => ({

}))(AppContainerUI);
