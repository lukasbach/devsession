import {editor, IPosition, IRange} from "monaco-editor";
import * as React from "react";
import {useRef} from "react";
import * as monacoEditor from "monaco-editor";
import MonacoEditor from "react-monaco-editor";
import {useEffect} from "react";


export interface ICodeEditorProps {
  editorModel: editor.IModel | null;
  readOnly: boolean;
  onEdit: (changes: editor.IModelContentChange[]) => void;
  onChangeCursorPosition: (position: IPosition) => void;
  onChangeSelection: (selection: IRange) => void;
  onDidMount: (monaco: typeof monacoEditor, editor: monacoEditor.editor.IStandaloneCodeEditor) => void;
  userSelections: editor.IModelDeltaDecoration[];
}

export const CodeEditor: React.FunctionComponent<ICodeEditorProps> = props => {
  const editor = useRef<monacoEditor.editor.IStandaloneCodeEditor>();
  const monaco = useRef<typeof monacoEditor>();
  const otherUserSelections = useRef<string[]>([]);

  useEffect(() => {
    monaco.current!.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false
    });
    monaco.current!.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false
    });

    editor.current!.onDidChangeModelContent(e => props.onEdit(e.changes));
    editor.current!.onDidChangeCursorPosition(e => props.onChangeCursorPosition(e.position));
    editor.current!.onDidChangeCursorSelection(e => props.onChangeSelection(e.selection));
  }, []);

  useEffect(() => editor.current!.updateOptions({ readOnly: props.readOnly }), [props.readOnly]);

  useEffect(() => {
    otherUserSelections.current = editor.current!.deltaDecorations(
      otherUserSelections.current || [],
      props.userSelections
    );
  }, [props.userSelections]);

  return (
    <MonacoEditor
      options={{

      }}
      editorDidMount={(e, m) => {
        props.onDidMount(m, e);
        editor.current = e;
        monaco.current = m;
      }}
    />
  );
};
