export interface IUserEditorPosition {
  path?: string;
  cursor?: ICodePosition;
  selection?: ICodeRange;
}

export interface ICodeRange {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export interface ICodePosition  {
  lineNumber: number;
  column: number;
}

export interface IChange {
  range: {
    startLineNumber: number,
    startColumn: number,
    endLineNumber: number,
    endColumn: number
  };
  rangeLength: number;
  text: string;
  rangeOffset: number;
  forceMoveMarkers: boolean;
}
