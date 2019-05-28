import * as React from "react";
import {css, StyleSheet} from "aphrodite";
import {Colors} from "@blueprintjs/core";
import {TitleInfo} from "./components/TitleInfo/TitleInfo";
import {Preview} from "./components/Preview/Preview";
import {AlphaWarningHeader} from "./components/AlphaWarningHeader/AlphaWarningHeader";

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: Colors.DARK_GRAY2
  }
});

export const App: React.FunctionComponent = props => (
  <div className={css(styles.container) + ' bp3-dark'}>
    <AlphaWarningHeader/>
    <TitleInfo/>
    <Preview
      title={'Powerful collaborative IDE'}
      text={'Quickly start a devsession server on your local machine, and your team members can join the session and' +
      ' work with you on your project\'s code. You can see your team members cursors and code changes in realtime, which' +
      ' makes it great for pair-programming, hackathons or just helping your colleague on a coding problem.'}
      videoFileName={'collaborative.mp4'}
    />

    <Preview
      title={'Customizable editor'}
      text={'You can change the color scheme of the editor and of the entire application and customize various other things.'}
      videoFileName={'customizable.mp4'}
    />

    <Preview
      title={'Filesystem integration'}
      text={'You get direct access to the project directory. All users can create, change and delete files and folders,' +
      ' if they have the sufficient permissions.'}
      videoFileName={'filesystem.mp4'}
    />

    <Preview
      title={'Easy to use permissions'}
      text={'You can precisely define the permissions that your team members have. They can directly ask for additional' +
      ' permissions within the application, if they require them.'}
      videoFileName={'permissions.mp4'}
    />

    <Preview
      title={'Professional permission management'}
      text={'In the permission admin panel you can get an overview of who can do what in your session and change the' +
      ' permissions that members have.'}
      videoFileName={'permissionmanagement.mp4'}
    />

    <Preview
      title={'Built-in terminal'}
      text={'You can create and operate terminals which run on the session host to build or run your code. Only users' +
      ' with sufficient permissions can access the terminals.'}
      videoFileName={'terminal.mp4'}
    />

    <Preview
      title={'Easy port forwarding'}
      text={'Building an web application and want everyone in your session to directly see the results? DevSession ' +
      'allows you to directly open up ports on which your development servers run using tools like localtunnel and ngrok.'}
      videoFileName={'portforwarding.mp4'}
    />
  </div>
);