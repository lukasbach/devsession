export type FSAction = IFsCreationAction | IFsDeletionAction | IFsRenameAction | IFsCopyAction;

export interface IFsCreationAction {
  type: "create";
  path: string;
  filename: string;
  isDir: boolean;
}

export interface IFsDeletionAction {
  type: "delete";
  path: string;
}

export interface IFsRenameAction {
  type: "rename";
  pathFrom: string;
  pathTo: string;
}

export interface IFsCopyAction {
  type: "copy";
  pathFrom: string;
  pathTo: string;
}
