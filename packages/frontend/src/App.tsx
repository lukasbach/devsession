import * as monacoEditor from "monaco-editor";
import React, {Component, useEffect, useRef} from "react";
import MonacoEditor from "react-monaco-editor";
import io from "socket.io-client";
import {SocketServer} from "./utils/socket";
import {SocketMessages} from "./types/communication";
import uuidv4 from 'uuid/v4';
import {AppContainer} from "./components/AppContainer/AppContainer";

const TestApp: React.FunctionComponent<{}> = (props) => {
  return <AppContainer/>;

  /*const editor = useRef<monacoEditor.editor.IStandaloneCodeEditor>();
  const monaco = useRef<typeof monacoEditor>();

  console.log(editor.current);

  useEffect(() => {
    SocketServer.emit<SocketMessages.Users.NewUser>("@@USERS/NEW_USER", {
      userdata: {
        id: uuidv4(),
        name: uuidv4(),
        cursor: {},
        selection: {},
        viewingFile: ''
      }
    });

    editor.current!.onDidChangeModelContent((e) => {
      console.log("onDidChangeModelContent", e);
      SocketServer.emit<SocketMessages.Editor.ChangedText>("@@EDITOR/CHANGED_TEXT", {user: 'a', path: 'test', changes: e.changes as any});
    });
    editor.current!.onDidChangeCursorPosition((e) => {
      console.log("onDidChangeCursorPosition", e);
    });
    editor.current!.onDidChangeCursorSelection((e) => {
      console.log("onDidChangeCursorSelection", e);
    });
    editor.current!.layout();
  });

  setTimeout(() => {
    const changeEvent = {changes: [{range: {startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 4}, rangeLength: 3, text: "AudioScheduledSourceNode", rangeOffset: 0, forceMoveMarkers: false}], eol: "\r\n", versionId: 5, isUndoing: false, isRedoing: false, isFlush: false};

    editor.current!.getModel()!.applyEdits([{
      text: changeEvent.changes[0].text,
      forceMoveMarkers: false,
      range: new monacoEditor.Range(changeEvent.changes[0].range.startLineNumber, changeEvent.changes[0].range.startColumn, changeEvent.changes[0].range.endLineNumber, changeEvent.changes[0].range.endColumn)
    }]);
  }, 5000);

  return (
    <div>
      <MonacoEditor editorDidMount={(e, m) => {
        editor.current = e;
        monaco.current = m;
      }}/>
    </div>
  );*/
};

/*class TestApp extends Component {
  private editor: monacoEditor.editor.IStandaloneCodeEditor;
  private monaco: typeof monacoEditor;

  componentDidMount(): void {
    this.editor.current.onDidChangeModelContent(e => {
      console.log("onDidChangeModelContent", e);
    });
    this.editor.current.onDidChangeCursorPosition(e => {
      console.log("onDidChangeCursorPosition", e);
    });
    this.editor.current.onDidChangeCursorSelection(e => {
      console.log("onDidChangeCursorSelection", e);
    });
    this.editor.current.layout();
  }

  render() {
    return (
      <div>
        <MonacoEditor editorDidMount={(e, m) => {
          this.editor.current = e;
          this.monaco.current = m;
        }}/>
      </div>
    );
  }
}*/

class App extends Component {
  constructor(props: {}) {
    super(props);
  }


  public render() {
    return <TestApp />;
  }
}

export default App;
