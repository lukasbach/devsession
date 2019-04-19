import * as monacoEditor from "monaco-editor";
import {Uri} from "monaco-editor";
import FileSystemService from "./FileSystemService";
import {SocketMessages} from "@devsession/common";
import {SocketServer} from "./SocketServer";

export default class MonacoModelService {
  private static instance: MonacoModelService = new MonacoModelService();
  private monaco: typeof monacoEditor | undefined;
  private openedFiles: string[] = [];

  public propagationSafeFlag = true;

  private constructor() {
    this.setupChangedTextListener();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new MonacoModelService();
    }
    return this.instance;
  }

  public setMonaco(monaco: typeof monacoEditor) {
    this.monaco = monaco;
  }

  public addModel(path: string, value: string) {
    if (this.openedFiles.includes(path)) {
      const model = this.monaco!.editor.getModel(this.pathToUri(path))!;
      this.propagationSafeFlag = false;
      model.setValue(value);
      this.propagationSafeFlag = true;
      return model;
    } else {
      this.openedFiles.push(path);
      return this.monaco!.editor.createModel(value, undefined, this.pathToUri(path));
    }
  }

  public async openModel(path: string) {
    const val = await FileSystemService.getFileContents(path);
    return this.addModel(path, val.contents);
  }

  public getModel(path: string) {
    try {
      return this.monaco!.editor.getModel(this.pathToUri(path));
    } catch(e) {
      return undefined;
    }
  }

  public pathToUri(path: string) {
    return Uri.from({
      scheme: 'file',
      path: path
    })
  }

  private setupChangedTextListener() {
    SocketServer.on<SocketMessages.Editor.NotifyChangedText>("@@EDITOR/NOTIFY_CHANGED_TEXT", payload => {
      const model = this.getModel(payload.path);

      if (model) {
        this.propagationSafeFlag = false;
        model.applyEdits(payload.changes.map(change => ({
          ...change,
          range: new monacoEditor.Range(
            change.range.startLineNumber,
            change.range.startColumn,
            change.range.endLineNumber,
            change.range.endColumn
          )
        })));
        this.propagationSafeFlag = true;
      }
    });
  }
}