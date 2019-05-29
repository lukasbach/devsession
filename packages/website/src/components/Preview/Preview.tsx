import * as React from "react";
import {css, StyleSheet} from "aphrodite";
import {Colors} from "@blueprintjs/core";

const styles = StyleSheet.create({
  video: {
    width: '65%',
    marginTop: '-2.5%',
    marginBottom: '-3%'
  },
  videoContainer: {
    overflow: 'hidden'
  },
  container: {
    padding: '40px 100px',
    color: Colors.GRAY1,
    transition: 'color .3s ease',
    ':hover': {
      color: Colors.GRAY3
    }
  },
  subTextContainer: {
    paddingLeft: '3em',
    width: '65%'
  },
  subTextHead: {
    paddingLeft: '2em'
  },
  subTextText: {
    paddingLeft: '6em'
  }
});

export const Preview: React.FunctionComponent<{
  videoFileName: string;
  title?: string;
  text?: string;
}> = props => {

  return (
    <div className={css(styles.container)}>
      <div className={css(styles.videoContainer)}>
        <video controls={false} className={css(styles.video)} playsinline={true} autoPlay={true} muted={true} loop={true}>
          <source src={`https://lukasbach.github.io/devsession-videos/${props.videoFileName}`} type="video/mp4" />
        </video>
      </div>

      { props.title && props.text && (
        <div className={css(styles.subTextContainer)}>
          <h1 className={css(styles.subTextHead)}>{ props.title }</h1>
          <p className={css(styles.subTextText)}>{ props.text }</p>
        </div>
      )}
    </div>
  )
}