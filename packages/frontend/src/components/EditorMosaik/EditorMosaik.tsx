import * as React from "react";
import uuidv4 from 'uuid/v4';
import {EditorContainer} from "../EditorContainer/EditorContainer";
import {useRef} from "react";

export const EditorMosaik: React.FunctionComponent<{}> = props => {
  const mosaikId = useRef(uuidv4());

  return (
    <EditorContainer mosaikId={mosaikId.current} />
  );
};
