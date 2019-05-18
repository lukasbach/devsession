import * as React from "react";
import {css, StyleSheet} from "aphrodite";
import {Colors} from "@blueprintjs/core";
import {TitleInfo} from "./components/TitleInfo/TitleInfo";

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: Colors.DARK_GRAY2
  }
});

export const App: React.FunctionComponent = props => (
  <div className={css(styles.container) + ' bp3-dark'}>
    <TitleInfo/>
  </div>
);