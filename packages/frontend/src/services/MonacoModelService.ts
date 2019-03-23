import * as monacoEditor from "monaco-editor";
import {Uri} from "monaco-editor";
import FileSystemService from "./FileSystemService";

export default class MonacoModelService {
  private static instance: MonacoModelService = new MonacoModelService();
  private monaco: typeof monacoEditor | undefined;
  private openedFiles: string[] = [];

  private constructor() {

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
      model.setValue(value);
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
}