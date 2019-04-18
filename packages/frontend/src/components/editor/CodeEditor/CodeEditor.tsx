import * as monacoEditor from "monaco-editor";
import {editor, IPosition, IRange} from "monaco-editor";
import * as React from "react";
import {useEffect, useRef} from "react";
import MonacoEditor from "react-monaco-editor";
import {ResizeSensor} from "@blueprintjs/core";
import {IUserEditorPosition} from "@devsession/common/src/types/editor";


export interface ICodeEditorProps {
  filePath: string;
  editorModel: editor.IModel | null;
  readOnly: boolean;
  onEdit: (changes: editor.IModelContentChange[]) => void;
  onChangeCursorPosition: (position: IPosition) => void;
  onChangeSelection: (selection: IRange) => void;
  onDidMount: (monaco: typeof monacoEditor, editor: monacoEditor.editor.IStandaloneCodeEditor) => void;
  userSelections: editor.IModelDeltaDecoration[];
  navigateToPosition: Required<IUserEditorPosition> | undefined;
  resolveNavigateToPosition: () => void;
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
  }, [props.userSelections, props.filePath, props.editorModel]);

  useEffect(() => {
    console.log("navigate", props.navigateToPosition, editor.current, props);
    if (editor.current && props.navigateToPosition) {
      setTimeout(() => {
        editor.current!.revealRangeInCenterIfOutsideViewport(props.navigateToPosition!.selection, 0);
        // editor.current!.setSelection(props.navigateToPosition!.selection);
        props.resolveNavigateToPosition();
      }, 1000);
    }
  }, [props.navigateToPosition]);

  return (
    <ResizeSensor onResize={() => editor.current!.layout()}>
      <MonacoEditor
        options={{

        }}
        editorDidMount={(e, m) => {
          props.onDidMount(m, e);
          editor.current = e;
          monaco.current = m;
        }}
      />
    </ResizeSensor>
  );
};
