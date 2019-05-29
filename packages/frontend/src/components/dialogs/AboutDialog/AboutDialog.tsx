import * as React from "react";
import {ThemedContainer} from "../../common/ThemedContainer";
import {Button, Dialog, H2} from "@blueprintjs/core";
import packageJson from "../../../../package.json";
import {CalloutBar} from "../../common/CalloutBar/CalloutBar";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutDialog: React.FunctionComponent<IProps> = props => {

  return (
    <ThemedContainer render={(theme: string, className: string) => (
      <Dialog
        className={className}
        isOpen={props.isOpen}
        onClose={props.onClose}
      >
        <div style={{ margin: '2em' }}>
          <H2>DevSession { packageJson.version }</H2>

          <p>Developed by <a href={'https://lukasbach.com'} target={'_blank'}>Lukas Bach</a>.</p>
        </div>

        <CalloutBar
          text={'GitHub Repository'}
          icon={'globe-network'}
          isDark={theme === 'dark'}
          actions={[{
            text: 'Open',
            onClick: () => window.open('https://github.com/lukasbach/devsession', '_blank')!.focus()
          }]}
        />

        <CalloutBar
          text={'Bugtracker'}
          icon={'globe-network'}
          isDark={theme === 'dark'}
          actions={[{
            text: 'Open',
            onClick: () => window.open('https://github.com/lukasbach/devsession/issues', '_blank')!.focus()
          }]}
        />

        <CalloutBar
          text={'DevSession website'}
          icon={'globe-network'}
          isDark={theme === 'dark'}
          actions={[{
            text: 'Open',
            onClick: () => window.open('https://lukasbach.github.io/devsession', '_blank')!.focus()
          }]}
        />

        <div style={{ margin: '2em 2em 1em 2em', textAlign: 'right' }}>
          <Button onClick={props.onClose}>Close</Button>
        </div>
      </Dialog>
    )} />
  );
};
