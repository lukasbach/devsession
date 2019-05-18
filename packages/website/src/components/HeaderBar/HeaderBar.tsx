import * as React from "react";
import {Colors} from "@blueprintjs/core";
import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.DARK_GRAY2,
    padding: '2em 6em'
  },
  titleText: {
    fontSize: '4em',
    color: Colors.LIGHT_GRAY2
  }
});

export const HeaderBar: React.FunctionComponent<{}> = props => {

  return (
    <div className={css(styles.container)}>
      <h1 className={css(styles.titleText)}>DevSession</h1>
    </div>
  )
};
