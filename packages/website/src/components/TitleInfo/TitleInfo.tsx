import * as React from "react";
import {Button, Colors, InputGroup} from "@blueprintjs/core";
import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
  getStarted: {
    width: '30%',
    position: 'fixed',
    right: 0
  },
  getStartedBox: {
    margin: '6em',
    border: `1px solid ${Colors.GRAY3}`,
    borderRadius: '1em'
  },
  getStartedBoxSection: {
    textAlign: 'center',
    color: Colors.GRAY3,
    borderBottom: `1px solid ${Colors.GRAY3}`,
    padding: '2em',
    transition: 'color .1s ease',
    ':last-child': {
      borderBottom: '0'
    },
    ':hover': {
      color: Colors.GRAY5
    }
  }
});

export const TitleInfo: React.FunctionComponent<{}> = props => {
  const copyCommand = () => {
    const i = document.getElementById('npxDevsessionInput')! as HTMLInputElement;
    i.select();
    document.execCommand('copy');
  };

  return (
    <div className={css(styles.getStarted)}>
      <div className={css(styles.getStartedBox)}>
        <div className={css(styles.getStartedBoxSection)}>
          <h1 style={{
            fontSize: '2em',
            letterSpacing: '8px'
          }}>
            DevSession
          </h1>
        </div>
        <div className={css(styles.getStartedBoxSection)}>
          <p>Open-Source collaborative IDE with many features and extremely quick setup!</p>
        </div>
        <div className={css(styles.getStartedBoxSection)}>
          <p>Node installed? Get started in under a minute with a single terminal command!</p>
          <InputGroup
            id={'npxDevsessionInput'}
            large={true}
            readOnly={true}
            leftIcon="console"
            onClick={copyCommand}
            rightElement={(
              <Button
                icon={'clipboard'}
                minimal={true}
                onClick={copyCommand}
              />
            )}
            value={'npx devsession'}
          />
          </div>
        <div className={css(styles.getStartedBoxSection)}>
          <p>Download the devsession GUI starter for Windows</p>
          <form method={'get'} action={'https://github.com/lukasbach/devsession/releases/download/latest/devsession-win.zip'}>
            <Button
              intent={"primary"}
              icon={"download"}
              large={true}
              type={'submit'}
            >
              Download
            </Button>
          </form>
          <p style={{marginTop: '1em'}}>
            <a
              href={'https://github.com/lukasbach/devsession/releases'}
              target={'_blank'}
            >
              Other download options...
            </a>
          </p>
        </div>
      </div>
    </div>
  )
};
