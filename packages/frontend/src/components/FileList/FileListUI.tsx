import * as React from "react";
import {useEffect, useState} from "react";
import {IFileObject, IFolderObject} from "../../types/filelist";
import FileSystemService from "../../services/FileSystemService";
import * as path from "path";
import {FileListUIProps} from "./FileList";


const findItem = (folderPath: string, root: IFolderObject): IFolderObject | IFileObject => {
  folderPath = path.normalize(folderPath);
  folderPath = folderPath.replace(new RegExp(`[/|\\\\]`, 'g'), path.sep);
  folderPath = folderPath === '.' ? '' : folderPath;
  if (folderPath === '') {
    return root;
  } else if (!root.isDir) {
    throw Error(`Trying to find folder in a file. Path is ${folderPath}`);
  } else if (!root.contents) {
    throw Error(`Trying to step into folder which has not loaded. Path is ${folderPath}`);
  } else {
    const [piece, ...restPieces] = folderPath.split(path.sep);
    const rest = restPieces.join(path.sep);
    const next = root.contents.find(item => item.name === piece);
    if (!next) {
      console.log(piece, rest, root.contents, path.sep);
      throw Error(`Cannot find next element. Path is ${folderPath}`);
    } else if (!rest || rest === '') {
      return next;
    } else if (!next.isDir) {
      throw Error(`Next element is no folder. Path is ${folderPath}`);
    } else {
      return findItem(rest, next as IFolderObject);
    }
  }
};

const sortFileList = (list: Array<IFolderObject | IFileObject>): Array<IFolderObject | IFileObject> => {
  return list.sort((a, b) => {
    if (a.isDir !== b.isDir) {
      return a.isDir ? -1 : 1;
    } else {
      return a.name.localeCompare(b.name);
    }
  });
};

export const FileListUI: React.FunctionComponent<FileListUIProps> = props => {
  const [root, setRoot] = useState<IFolderObject>({
    name: 'root',
    path: '',
    expanded: true,
    isDir: true,
    contents: undefined
  });

  const onClickItem = async (itemPath: string) => {
    const rootCopy = {...root};
    const item = findItem(itemPath, rootCopy);
    console.log("Clicked on item", itemPath, item);

    if (item.isDir) {
      (item as IFolderObject).expanded = !(item as IFolderObject).expanded;
      if (!(item as IFolderObject).contents) {
        item.contents = (await FileSystemService.getDirectoryContents(itemPath)).files.map(i => ({
          name: i.filename,
          path: i.path,
          isDir: i.isDir,
          expanded: i.isDir ? false : undefined,
          contents: undefined
        }));
      }
    } else {
      props.openFile(itemPath);
    }

    setRoot(rootCopy);
  };

  useEffect(() => {(async () => { await onClickItem(''); })()}, []);

  if (!root.contents) {
    return <div>No items...</div>;
  } else {
    return (
      <div>
        { sortFileList(root.contents).map(i => <FileItem key={i.path} item={i} onClick={onClickItem} />) }
      </div>
    )
  }
};

const FileItem: React.FunctionComponent<{
  item: IFileObject | IFolderObject,
  onClick: (path: string) => void,
}> = props => {

  return (
    <div>
      <div>
        <div onClick={() => props.onClick(props.item.path)}>{props.item.name}</div>
      </div>

      {
        props.item.isDir && (props.item as IFolderObject).expanded && props.item.contents && (
          <div>
            { sortFileList((props.item as IFolderObject).contents!).map(i => <FileItem key={i.path} item={i} onClick={props.onClick}/>) }
          </div>
        )
      }
    </div>
  )
};
