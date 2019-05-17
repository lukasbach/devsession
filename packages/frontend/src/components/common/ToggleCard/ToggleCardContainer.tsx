import * as React from "react";

import "./ToggleCardContainer.css";

export const ToggleCardContainer: React.FunctionComponent<{
}> = props => {

  return (
    <div className={'toggleCardContainer'}>
      { props.children }
    </div>
  )
};
