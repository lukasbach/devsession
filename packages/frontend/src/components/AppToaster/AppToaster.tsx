import * as React from "react";
import {Toaster} from "@blueprintjs/core";
import {useEffect, useRef} from "react";

export let appToasterRef = Toaster.create({  });

export const AppToaster: React.FunctionComponent<{}> = props => {
  const toasterRef = useRef<Toaster | null>();

  useEffect(() => { appToasterRef = toasterRef.current!; }, []);

  return (
    <Toaster
      canEscapeKeyClear={true}
      position={"top-right"}
      ref={r => toasterRef.current = r}
    />
  );
};
