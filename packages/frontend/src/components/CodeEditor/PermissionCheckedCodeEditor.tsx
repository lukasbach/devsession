import * as React from "react";
import {Button, Colors, NonIdealState} from "@blueprintjs/core";
import {requestPathPermission} from "../../utils/permissions";
import {CodeEditorConnector, ICodeEditorConnectorProps} from "./CodeEditorConnector";

export const PermissionCheckedCodeEditor: React.FunctionComponent<{
  editorProps: ICodeEditorConnectorProps;
}> = props => {
  if (!props.editorProps.activeFile) {
    return (
      <NonIdealState
          icon={'warning-sign'}
          title={'No file open'}
          description={'Open a file from the list on the left to start coding.'}
      />
    );
  }

  if (!props.editorProps.permissionData.mayRead) {
    return (
      <NonIdealState
        icon={'warning-sign'}
        title={'No read permission'}
        description={'You do not have the required permissions to view this file. You can request permissions for this ' +
        'specific file with the buttons below, or you can request permissions for an entire folder in the filelist ' +
        'on the left by right-clicking an item and requesting permissions from there.'}
        action={(
          <>
            <Button icon={'eye-open'} onClick={() => {
              requestPathPermission(props.editorProps.activeFile, props.editorProps.actingUser.id, {
                mayRead: true,
                mayWrite: false,
                mayDelete: false
              })
            }}>
              Request read permission
            </Button>
            <Button icon={'edit'} onClick={() => {
              requestPathPermission(props.editorProps.activeFile, props.editorProps.actingUser.id, {
                mayRead: true,
                mayWrite: true,
                mayDelete: false
              })
            }}>
              Request read and write permission
            </Button>
          </>
        )}
      />
    );
  }

  const noWriteError = (
    <div style={{ backgroundColor: Colors.ORANGE5, color: Colors.ORANGE1, padding: '1.3em' }}>
      You do not have write permission on this file.&nbsp;&nbsp;&nbsp;
      <Button icon={"edit"} intent={"warning"} onClick={() => {
        requestPathPermission(props.editorProps.activeFile, props.editorProps.actingUser.id, {
          mayRead: true,
          mayWrite: true,
          mayDelete: undefined
        });
      }}>
        Request write permission
      </Button>
    </div>
  );

  const editor = (
    <CodeEditorConnector
      {...props.editorProps}
    />
  );

  if (!props.editorProps.permissionData.mayWrite) {
    return (
      <div style={{height: '100%'}}>
        { noWriteError }
        { editor }
      </div>
    )
  } else {
    return editor;
  }
};
