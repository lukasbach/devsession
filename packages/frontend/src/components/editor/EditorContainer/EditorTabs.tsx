import * as React from "react";
import * as path from "path";
import {TabBar} from "../../common/TabBar/TabBar";
import {Button} from "@blueprintjs/core";
import {SocketServer} from "../../../services/SocketServer";
import {SocketMessages} from "@devsession/common";


export const EditorTabs: React.FunctionComponent<{
  openedFiles: string[];
  activeFile?: string;
  onCloseFile: (filePath: string) => void;
  onChangeFile: (filePath: string) => void;
}> = props => {

  return (
    <TabBar
      values={props.openedFiles.map(file => ({
        id: file,
        text: path.basename(file.replace(/\\/g, '/')),
        canClose: true
      }))}
      activeValue={props.activeFile || null}
      onClose={file => props.onCloseFile(file as string)}
      onChange={file => props.onChangeFile(file as string)}
      actions={[
        props.activeFile && (
          <Button
            icon={"floppy-disk"}
            onClick={() => {
              SocketServer.emit<SocketMessages.Editor.ForceSave>("@@EDITOR/FORCE_SAVE", {
                path: props.activeFile!
              })
            }}
            minimal
            small
          />
        )
      ]}
    />
  )
};