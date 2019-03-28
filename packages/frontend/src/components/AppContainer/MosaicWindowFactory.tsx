import {MosaicWindow} from "react-mosaic-component";
import * as React from "react";
import {IWindowIdentifiers} from "../../types/mosaic";
import {MosaicBranch} from "react-mosaic-component/src/types";
import {FileList} from "../FileList/FileList";
import {UserList} from "../UserList/UserList";
import {EditorMosaik} from "../EditorMosaik/EditorMosaik";

export const MosaicWindowFactory = (window: IWindowIdentifiers, path: MosaicBranch[]): JSX.Element => {
  if (window === '@@WIN/FILELIST') {
    return (
      <MosaicWindow<IWindowIdentifiers> path={path} title={'Project'}>
        <FileList />
      </MosaicWindow>
    );
  }

  if (window === '@@WIN/CODE') {
    return (
      <MosaicWindow<IWindowIdentifiers> path={path} title={'Code'}>
        <EditorMosaik/>
      </MosaicWindow>
    );
  }

  if (window === '@@WIN/USERS') {
    return (
      <MosaicWindow<IWindowIdentifiers> path={path} title={'Code'}>
        <UserList />
      </MosaicWindow>
    );
  }

  throw Error('Could not create window.');
};