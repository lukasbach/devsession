import * as React from "react";
import {FSAction, IFsCreationAction, IFsDeletionAction, IFsRenameAction} from "@devsession/common/src/types/fsactions";
import {Callout, FormGroup, InputGroup} from "@blueprintjs/core";
import FileSystemService from "../../../services/FileSystemService";
import {useEffect, useState} from "react";
import * as pathLib from "path";
import {normalizeProjectPath} from "@devsession/common/src/utils/projectpath";

interface IProps<ACTION extends FSAction> {
  action: ACTION;
  onChange: (action: ACTION) => void;
  onError: (error: string | null) => void;
}

const useCheckFsItemAlreadyExists = (
  path: string,
  filename: string,
  onError: (error: string | null) => void,
  errorMessage: string
) => {
  const [dirContents, setDirContents] = useState<string[]>([]);

  useEffect(() => {
    FileSystemService.getDirectoryContents(path)
      .then(contents => setDirContents(contents.files.map(f => f.filename)));
  }, []);

  useEffect(() => {
    console.log(dirContents, filename, path);
    if (dirContents.find(f => f.toLocaleLowerCase() === filename.toLocaleLowerCase())) {
      onError(errorMessage);
    } else {
      onError(null);
    }
  }, [filename]);
};

export const FsActionFormCreateFile: React.FunctionComponent<IProps<IFsCreationAction>> = props => {
  useCheckFsItemAlreadyExists(
    props.action.path,
    props.action.filename,
    props.onError,
    `There is already an file with the name ${props.action.filename} at the selected location.`
  );

  return (
    <div>
      <FormGroup
        label="Filename"
        labelFor="text-input"
      >
        <InputGroup
          id="text-input"
          placeholder="Filename"
          value={props.action.filename}
          onChange={(e: any) => props.onChange({...props.action, filename: e.target.value})}
        />
      </FormGroup>
    </div>
  );
};

export const FsActionFormCreateFolder: React.FunctionComponent<IProps<IFsCreationAction>> = props => {
  useCheckFsItemAlreadyExists(
    props.action.path,
    props.action.filename,
    props.onError,
    `There is already an folder with the name ${props.action.filename} at the selected location.`
  );

  return (
    <div>
      <FormGroup
        label="Folder name"
        labelFor="text-input"
      >
        <InputGroup
          id="text-input"
          placeholder="Foldername"
          value={props.action.filename}
          onChange={(e: any) => props.onChange({...props.action, filename: e.target.value})}
        />
      </FormGroup>
    </div>
  );
};

export const FsActionFormRename: React.FunctionComponent<IProps<IFsRenameAction>> = props => {
  const pathSplit = normalizeProjectPath(props.action.pathTo).split(pathLib.sep);
  const dirname = pathSplit.slice(0, pathSplit.length - 1).join(pathLib.sep);
  const basename = pathSplit[pathSplit.length - 1];

  useCheckFsItemAlreadyExists(
    dirname,
    basename,
    props.onError,
    `There is already an item with the name ${basename} at the selected location.`
  );

  return (
    <div>
      <FormGroup
        label="New name"
        labelFor="text-input"
      >
        <InputGroup
          id="text-input"
          placeholder="New name"
          value={basename}
          onChange={(e: any) => {
            if (e.target.value === '') {
              props.onError('May not be empty.');
            } else {
              props.onChange({...props.action, pathTo: pathLib.join(dirname, e.target.value)})
            }
          }}
        />
      </FormGroup>
    </div>
  );
};

export const FsActionFormDelete: React.FunctionComponent<IProps<IFsDeletionAction>> = props => {
  return (
    <div>
      You are about to delete the following files:

      <ul>
        {
          props.action.paths.map(p => <li key={p}>{p}</li>)
        }
      </ul>

      <Callout intent={"danger"} icon={"warning-sign"}>
        This can not be undone!
      </Callout>
    </div>
  );
};

