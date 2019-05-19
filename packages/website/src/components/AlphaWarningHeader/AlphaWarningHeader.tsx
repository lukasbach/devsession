import * as React from "react";
import {Colors} from "@blueprintjs/core";

export const AlphaWarningHeader: React.FunctionComponent = props  => (
  <div style={{
    backgroundColor: Colors.ORANGE1,
    color: Colors.ORANGE5,
    padding: '1em'
  }}>
    This is a very early alpha version! The software and this website are not in a final state.
  </div>
)