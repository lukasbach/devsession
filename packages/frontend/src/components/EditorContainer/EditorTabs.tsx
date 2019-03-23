import * as React from "react";
import {Button} from "@blueprintjs/core";
import * as path from "path";

import "./tabs.css";

export const EditorTabs: React.FunctionComponent<{
  openedFiles: string[];
  activeFile: string;
  onCloseFile: (filePath: string) => void;
  onChangeFile: (filePath: string) => void;
}> = props => {

  return (
    <div className={'editortabs'}>
      {
        props.openedFiles.map(file => (
          <EditorTab
            key={file}
            active={props.activeFile === file}
            file={file}
            onClick={() => {
              console.log("open file")
              props.onChangeFile(file)
            }}
            onClose={() => {
              console.log("close file");
              props.onCloseFile(file)
            }}
          />
        ))
      }
    </div>
  )
};

const EditorTab: React.FunctionComponent<{
  file: string;
  active: boolean;
  onClose: () => void;
  onClick: () => void;
}> = props => (
  <div className={['editortabs-tab', props.active && 'active'].join(' ')} onClick={props.onClick}>
    { path.basename(props.file.replace(/\\/g, '/')) }
    <Button
      icon={'cross'}
      onClick={(e: any) => {
        e.stopPropagation();
        props.onClose();
      }}
      minimal small />
  </div>
);