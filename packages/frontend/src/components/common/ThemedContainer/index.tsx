import {Classes} from "@blueprintjs/core";
import {connect} from "react-redux";
import {IState} from "../../../store";
import * as React from "react";


interface IOwnProps { render?: (theme: 'dark' | 'light', className: string) => JSX.Element }
interface IStateProps extends IOwnProps { theme: 'dark' | 'light' }

const Comp: React.FunctionComponent<IStateProps> = props => (
  <div className={props.theme === "dark" ? Classes.DARK : undefined}>
    { props.children }
    { props.render ? props.render(props.theme, props.theme === "dark" ? Classes.DARK : '') : null }
  </div>
);

export const ThemedContainer = connect<IStateProps, {}, IOwnProps, IState>((state, ownProps) => ({
  theme: state.settings.app.applicationTheme
}), (dispatch, ownProps) => ({
}))(Comp);
