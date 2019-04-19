import {IUserWithLocalData} from "@devsession/common";
import {IFileSystemPermissionData} from "@devsession/common";
import * as React from "react";
import {editor, IPosition, IRange} from "monaco-editor";
import * as monacoEditor from "monaco-editor";
import MonacoModelService from "../../../services/MonacoModelService";
import {SocketMessages} from "@devsession/common";
import {areFsPermissionDatasetsEqual} from "@devsession/common";
import {CodeEditor} from "./CodeEditor";
import {IUserEditorPosition} from "@devsession/common";
import {SocketServer} from "../../../services/SocketServer";

export interface ICodeEditorConnectorProps {
  openedFiles: string[];
  activeFile: string;
  actingUser: IUserWithLocalData;
  otherUsers: IUserWithLocalData[];
  appTheme: 'dark' | 'light';
  theme: string;
  permissionData: IFileSystemPermissionData;
  navigateToPosition: Required<IUserEditorPosition> | undefined;
  resolveNavigateToPosition: () => void;
}

export class CodeEditorConnector extends React.Component<ICodeEditorConnectorProps, {
  model: editor.IModel | null;
  permissionData: IFileSystemPermissionData;
  userSelections: editor.IModelDeltaDecoration[];
}> {
  private monaco: typeof monacoEditor | undefined;
  private editor: monacoEditor.editor.IStandaloneCodeEditor | undefined;
  private monacoModelService = MonacoModelService.getInstance();
  private otherUserComparisonString: string = '';

  private nextUserPosition: IUserEditorPosition = {};
  private isNextUserPositionUpdateIssued = false;

  constructor(props: ICodeEditorConnectorProps) {
    super(props);

    this.onDidEditorMount = this.onDidEditorMount.bind(this);
    this.onDidChangeCursorPosition = this.onDidChangeCursorPosition.bind(this);
    this.onDidChangeCursorSelection = this.onDidChangeCursorSelection.bind(this);
    this.handleOpenedFile = this.handleOpenedFile.bind(this);
    this.handleClosedFile = this.handleClosedFile.bind(this);
    this.onEdit = this.onEdit.bind(this);

    this.state = {
      model: null,
      permissionData: props.permissionData,
      userSelections: []
    };
  }

  componentDidMount(): void {
    this.handleOpenedFile(this.props.activeFile);
    this.handleActiveFileChange(this.props.activeFile, '');
    this.handleThemeChange('', this.props.theme);
    this.handleOtherUserSelectionChange();
  }

  componentDidUpdate(prevProps: Readonly<ICodeEditorConnectorProps>) {
    const closedFiles = prevProps.openedFiles.filter(f => !this.props.openedFiles.includes(f));
    const newlyOpenedFiles = this.props.openedFiles.filter(f => !prevProps.openedFiles.includes(f));

    closedFiles.forEach(this.handleClosedFile);
    newlyOpenedFiles.forEach(this.handleOpenedFile);

    this.handleActiveFileChange(this.props.activeFile, prevProps.activeFile);
    this.handleThemeChange(prevProps.theme, this.props.theme);

    if (!areFsPermissionDatasetsEqual(this.props.permissionData, prevProps.permissionData)) {
      this.setState({ permissionData: this.props.permissionData });
    }

    const newComparisonString = JSON.stringify(this.props.otherUsers);
    if (
      newComparisonString !== this.otherUserComparisonString
      || this.props.activeFile !== prevProps.activeFile
      || this.props.theme !== prevProps.theme
      || this.props.appTheme !== prevProps.appTheme
    ) {
      this.handleOtherUserSelectionChange();
      this.otherUserComparisonString = newComparisonString;
    }
  }

  private onDidEditorMount(m: typeof monacoEditor, e: monacoEditor.editor.IStandaloneCodeEditor) {
    this.monaco = m;
    this.editor = e;
    this.monacoModelService.setMonaco(m);
  }

  private handleOpenedFile(path: string) {
    (async () => {
      SocketServer.emit<SocketMessages.Editor.OpenedFile>("@@EDITOR/OPEN_FILE", { path });
      await this.monacoModelService.openModel(path);
    })();
  }

  private handleClosedFile(path: string) {
    SocketServer.emit<SocketMessages.Editor.ClosedFile>("@@EDITOR/CLOSE_FILE", { path });
  }

  private handleActiveFileChange(newActiveFile: string, previousActiveFile: string) {
    if (newActiveFile !== previousActiveFile) {
      (async () => {
        SocketServer.emit<SocketMessages.Users.UserChangedData>("@@USERS/USER_CHANGED_DATA", {
          userdata: {
            position: {
              path: newActiveFile
            }
          }
        });

        const model = await this.monacoModelService.openModel(newActiveFile);
        this.setState({ model, permissionData: this.props.permissionData });

        this.monacoModelService.propagationSafeFlag = false;
        this.editor!.setModel(model);
        this.monacoModelService.propagationSafeFlag = true;
      })();
    }
  }

  private handleOtherUserSelectionChange() {
    const users = this.props.otherUsers
      .filter(user => (
        !user.isItMe
        && user.position.path === this.props.activeFile
        && user.position
        && user.position.path
        && user.position.selection
      ));

    const userSelections = users.map(u => ({...u.position.selection!, id: u.id})).map(s => ({
      range: new monacoEditor.Range(s!.startLineNumber, s!.startColumn, s!.endLineNumber, s!.endColumn),
      options: { inlineClassName: `css-user-selection-${s.id}` }
    }));

    const oldStylesheet = document.getElementById("editor-stylesheet");
    if (oldStylesheet) oldStylesheet.remove();
    const style = document.createElement("style");
    style.id = "editor-stylesheet";
    style.innerHTML = users.map(u => `.css-user-selection-${u.id} { background-color: ${this.props.appTheme === "light" ? u.color.lightColor : u.color.darkColor} }`).join('\n');
    document.head.appendChild(style);

    this.setState({ userSelections });
  }

  private handleThemeChange(oldTheme: string, newTheme: string) {
    if (!this.monaco || !newTheme || oldTheme === newTheme) return;

    const defaultThemes = ['vs', 'vs-dark', 'hc-black'];

    if (defaultThemes.includes(newTheme)) {
      this.monaco.editor.setTheme(newTheme);
    } else {
      fetch(`/themes/${newTheme}.json`)
        .then(data => data)
        .then(data => data.json())
        .then(data => {
          this.monaco!.editor.defineTheme(newTheme, data);
          this.monaco!.editor.setTheme(newTheme);
        })
    }
  }

  private onEdit(changes: editor.IModelContentChange[]) {
    if (this.monacoModelService.propagationSafeFlag) {
      SocketServer.emit<SocketMessages.Editor.ChangedText>("@@EDITOR/CHANGED_TEXT", {
        path: this.props.activeFile,
        changes: changes
      });
    }
  }

  // noinspection JSMethodCanBeStatic
  private onDidChangeCursorPosition(cursor: IPosition) {
    this.nextUserPosition.cursor = cursor;
    this.issueNextUserPositionUpdate();
  }

  // noinspection JSMethodCanBeStatic
  private onDidChangeCursorSelection(selection: IRange) {
    this.nextUserPosition.selection = selection;
    this.issueNextUserPositionUpdate();
  }

  private issueNextUserPositionUpdate() {
    if (!this.isNextUserPositionUpdateIssued) {
      this.isNextUserPositionUpdateIssued = true;
      setTimeout(() => {
        SocketServer.emit<SocketMessages.Users.UserChangedData>("@@USERS/USER_CHANGED_DATA", {
          userdata: { position: this.nextUserPosition  }
        });
        this.nextUserPosition = {};
        this.isNextUserPositionUpdateIssued = false;
      }, 10);
    }
  }

  render() {
    return (
      <CodeEditor
        filePath={this.props.activeFile}
        onDidMount={this.onDidEditorMount}
        editorModel={this.state.model}
        readOnly={!this.state.permissionData.mayWrite || false}
        onEdit={this.onEdit}
        onChangeCursorPosition={this.onDidChangeCursorPosition}
        onChangeSelection={this.onDidChangeCursorSelection}
        userSelections={this.state.userSelections}
        navigateToPosition={this.props.navigateToPosition}
        resolveNavigateToPosition={this.props.resolveNavigateToPosition}
      />
    );
  }
}