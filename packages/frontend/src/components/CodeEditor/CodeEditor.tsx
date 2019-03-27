import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {SocketServer} from "../../utils/socket";
import {SocketMessages} from "../../types/communication";
import * as monacoEditor from "monaco-editor";
import MonacoEditor from "react-monaco-editor";
import MonacoModelService from "../../services/MonacoModelService";
import {MutableRefObject} from "react";
import {IUserWithLocalData} from "../../types/users";
import {IFileSystemPermissionData} from "../../types/permissions";
import {Button, NonIdealState} from "@blueprintjs/core";
import {requestPathPermission} from "../../utils/permissions";

function usePrevious<T>(value: T): T {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current!;
}

function usePropagationSafeModelChange(): [MutableRefObject<boolean>, (callback: () => any) => void] {
  const canPropagateModelChange = useRef(true);
  const doPropagationSafe = (callback: () => any) => {
    (async () => {
      canPropagateModelChange.current = false;
      const result = callback();
      if (result instanceof Promise) {
        await result;
      }
      canPropagateModelChange.current = true;
    })();
  };

  return [canPropagateModelChange, doPropagationSafe];
}

function useRefreshedProp<T>(prop: T): { current: T } {
  const ref = useRef(prop);
  useEffect(() => {
    ref.current = prop;
  }, [prop]);
  return ref;
}

export interface ICodeEditorProps {
  openedFiles: string[];
  activeFile: string;
  actingUser: IUserWithLocalData;
  otherUsers: IUserWithLocalData[];
  theme: string;
  appTheme: 'dark' | 'light';
  permissionData: IFileSystemPermissionData;
}

export const CodeEditor: React.FunctionComponent<ICodeEditorProps> = props => {
  const prevOpenedFiles = usePrevious(props.openedFiles);
  const editor = useRef<monacoEditor.editor.IStandaloneCodeEditor>();
  const monaco = useRef<typeof monacoEditor>();
  const otherUserSelections = useRef<string[]>([]);
  const activeFile = useRef(props.activeFile);
  const otherUsers = useRefreshedProp(props.otherUsers);
  const [canPropagateModelChange, doPropagationSafe] = usePropagationSafeModelChange();

  useEffect(() => {
    if (!props.theme) {
      return;
    }

    const defaultThemes = ['vs', 'vs-dark', 'hc-black'];

    if (defaultThemes.includes(props.theme)) {
      monaco.current!.editor.setTheme(props.theme);
    } else {
      fetch(`/themes/${props.theme}.json`)
        .then(data => data)
        .then(data => data.json())
        .then(data => {
          monaco.current!.editor.defineTheme(props.theme, data);
          monaco.current!.editor.setTheme(props.theme);
        })
    }
  }, [props.theme]);

  useEffect(() => editor.current!.updateOptions({ readOnly: !props.permissionData.mayWrite }), [props.permissionData.mayWrite]);

  useEffect(() => { activeFile.current = props.activeFile; }, [props.activeFile]);

  useEffect(() => {
    const openendFiles = props.openedFiles.filter(file => !(prevOpenedFiles || []).includes(file));
    openendFiles.forEach(path => {
      (async () => {
        SocketServer.emit<SocketMessages.Editor.OpenedFile>("@@EDITOR/OPEN_FILE", { path, user: '' });
        const model = await MonacoModelService.getInstance().openModel(path);
      })()
    });

    if (prevOpenedFiles) {
      const closedFiles = prevOpenedFiles.filter(file => !props.openedFiles.includes(file));
      closedFiles.forEach(path => SocketServer.emit<SocketMessages.Editor.ClosedFile>("@@EDITOR/CLOSE_FILE", { path, user: '' }));
    }
  });

  useEffect(() => {
    (async () => {
      SocketServer.emit<SocketMessages.Users.UserChangedData>("@@USERS/USER_CHANGED_DATA", {
        user: props.actingUser.id,
        userdata: {
          position: {
            path: props.activeFile
          }
        }
      });

      const model = await MonacoModelService.getInstance().openModel(props.activeFile);
      doPropagationSafe(() => editor.current!.setModel(model));
    })();
  }, [props.activeFile]);

  useEffect(() => {
    monaco.current!.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false
    });
    monaco.current!.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false
    });

    editor.current!.onDidChangeModelContent((e) => {
      if (canPropagateModelChange.current) {
        SocketServer.emit<SocketMessages.Editor.ChangedText>("@@EDITOR/CHANGED_TEXT", {
          user: props.actingUser.id,
          path: activeFile.current!,
          changes: e.changes as any
        });
      }
    });

    editor.current!.onDidChangeCursorPosition((e) => {
      SocketServer.emit<SocketMessages.Users.UserChangedData>("@@USERS/USER_CHANGED_DATA", {
        user: props.actingUser.id,
        userdata: {
          position: {
            cursor: {
              lineNumber: e.position.lineNumber,
              column: e.position.column
            }
          }
        }
      });
    });

    editor.current!.onDidChangeCursorSelection((e) => {
      SocketServer.emit<SocketMessages.Users.UserChangedData>("@@USERS/USER_CHANGED_DATA", {
        user: props.actingUser.id,
        userdata: {
          position: {
            selection: {
              startLineNumber: e.selection.startLineNumber,
              startColumn: e.selection.startColumn,
              endLineNumber: e.selection.endLineNumber,
              endColumn: e.selection.endColumn
            }
          }
        }
      });
    });

    editor.current!.layout();

    SocketServer.on<SocketMessages.Editor.ChangedText>("@@EDITOR/CHANGED_TEXT", payload => {
      const model = MonacoModelService.getInstance().getModel(payload.path);

      if (model) {
        doPropagationSafe(() => {
          model.applyEdits(payload.changes.map(change => ({
            ...change,
            range: new monacoEditor.Range(
              change.range.startLineNumber,
              change.range.startColumn,
              change.range.endLineNumber,
              change.range.endColumn
            )
          })));
        });
      }
    })
  }, []);

  useEffect(() => {
    const users = otherUsers.current
      .filter(user => !user.isItMe && user.position.path === props.activeFile && user.position && user.position.path && user.position.selection);

    const decorators = editor.current!.deltaDecorations(otherUserSelections.current!, users.map(u => ({...u.position.selection!, id: u.id})).map(s => ({
      range: new monaco.current!.Range(s!.startLineNumber, s!.startColumn, s!.endLineNumber, s!.endColumn),
      options: { inlineClassName: `css-user-selection-${s.id}` }
    })));

    otherUserSelections.current = decorators;

    const oldStylesheet = document.getElementById("editor-stylesheet");
    if (oldStylesheet) oldStylesheet.remove();
    const style = document.createElement("style");
    style.id = "editor-stylesheet";
    style.innerHTML = users.map(u => `.css-user-selection-${u.id} { background-color: ${props.appTheme === "light" ? u.color.lightColor : u.color.darkColor} }`).join('\n');
    document.head.appendChild(style);

    // console.log(users, style.innerHTML, decorators, otherUsers.current, props);

    // editor.current!.d
  }, [otherUsers.current]);


  return (
    <MonacoEditor
      options={{

      }}
      editorDidMount={(e, m) => {
        MonacoModelService.getInstance().setMonaco(m);
        editor.current = e;
        monaco.current = m;
      }}
    />
  );
};
