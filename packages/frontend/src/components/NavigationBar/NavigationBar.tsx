import * as React from "react";

import "./style.css";
import {Alignment, Button, Classes, Navbar} from "@blueprintjs/core";

export const NavigationBar: React.FunctionComponent<{

}> = props => {

  return (
    <div>
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>CodeTogether</Navbar.Heading>
          <Navbar.Divider />
          <Button className="bp3-minimal" icon="home" text="Home" />
          <Button className="bp3-minimal" icon="git-branch" text="Git" />
          <Button className="bp3-minimal" icon="console" text="Windows" />
          <Button className="bp3-minimal" icon="settings" text="Settings" />
          <Button className="bp3-minimal" icon="help" text="Help" />
        </Navbar.Group>
      </Navbar>
      <Navbar className={['subnav', Classes.SMALL].join(' ')}>
        <Navbar.Group align={Alignment.LEFT}>
          <Button className="bp3-minimal" icon="home" text="Home" />
          <Button className="bp3-minimal" icon="document" text="Files" />
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Button className="bp3-minimal" icon="play" />
          <Button className="bp3-minimal" icon="stop" />
          <Button className="bp3-minimal" icon="lightbulb" />
        </Navbar.Group>
      </Navbar>
    </div>
  );
};
