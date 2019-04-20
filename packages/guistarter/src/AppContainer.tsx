import {Callout, Classes, Colors, H1} from "@blueprintjs/core";
import React from "react";

export const AppContainer: React.FunctionComponent<{}> = props => (
  <div
    className={Classes.DARK}
    style={{
      height: '100%',
      backgroundColor: Colors.DARK_GRAY3,
      padding: '2em'
    }}
  >
    <H1>DevSession Runner</H1>

    <Callout icon={"info-sign"}>
      <p className={Classes.TEXT_SMALL}>This is DevSession Runner, a GUI tool for creating sessions for the
        collaborative coding platform DevSession. Specify server options below and click on "Create Session"
        if you are finished.</p>
      <p className={Classes.TEXT_SMALL}>You can configure the session more in depth after it has started from
        within the DevSession user interface.</p>
    </Callout>

    <br />

    { props.children }
  </div>
);