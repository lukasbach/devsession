export interface IFileObject {
  name: string;
  path: string;
  isDir: boolean;
  contents: string | undefined;
}

export interface IFolderObject {
  name: string;
  path: string;
  isDir: boolean;
  expanded: boolean;
  contents: Array<IFileObject | IFolderObject> | undefined;
}
