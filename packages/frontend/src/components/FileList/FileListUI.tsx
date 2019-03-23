import * as React from "react";
import FileSystemService from "../../services/FileSystemService";
import {FileListUIProps} from "./FileList";
import {Classes, Icon, IconName, ITreeNode, Tooltip, Tree} from "@blueprintjs/core";
import * as pathLib from "path";

interface ITreeNodeStateExtension {
  path: string;
  isDir: boolean;
  filename: string;
}

interface IFileListUIState {
  nodes: Array<ITreeNode<ITreeNodeStateExtension>>
}

export class FileListUI extends React.Component<FileListUIProps, IFileListUIState> {
  state = {
    nodes: []
  };

  loadChildren = async (path: string): Promise<Array<ITreeNode<ITreeNodeStateExtension>>> => {
    const contents = (await FileSystemService.getDirectoryContents(path)).files;
    return contents.map(file => {
      const node: ITreeNode<ITreeNodeStateExtension> = {
        id: file.filename,
        hasCaret: file.isDir,
        label: file.filename,
        icon: (file.isDir ? "folder-close" : "document") as IconName,
        nodeData: {
          path: file.path,
          isDir: file.isDir,
          filename: file.filename
        }
      };

      node.secondaryLabel = this.getUserLabels(node);

      return node;
    })
  };

  sortFileList = (list: Array<ITreeNode<ITreeNodeStateExtension>>): Array<ITreeNode<ITreeNodeStateExtension>> => {
    return list.sort((a, b) => {
      if (a.nodeData!.isDir !== b.nodeData!.isDir) {
        return a.nodeData!.isDir ? -1 : 1;
      } else {
        return a.nodeData!.filename.localeCompare(b.nodeData!.filename);
      }
    });
  };

  getUserLabels = (node: ITreeNode<ITreeNodeStateExtension>) => {
    const users = this.props.watchedFiles.filter(f => {
      /*const relative = pathLib.relative(node.nodeData!.path, f.path);
      console.log("!!!", f.path, node.nodeData!.path, relative, pathLib.isAbsolute(relative));
      return relative && !relative.startsWith('..') && !pathLib.isAbsolute(relative);*/
      return node.isExpanded ? false : f.path.startsWith(node.nodeData!.path);
    });

    if (users.length === 0) return undefined;

    return (
      <>
        {
          users.map(u => (
            <Tooltip content={u.user.name}>
              <Icon icon="eye-open" color={u.user.color} />
            </Tooltip>
          ))
        }
      </>
    )
  };

  updateUserLabels = (node: ITreeNode<ITreeNodeStateExtension>) => {
    node.secondaryLabel = this.getUserLabels(node);
    if (node.childNodes) {
      node.childNodes.forEach(this.updateUserLabels);
    }
  };

  componentDidMount(): void {
    (async () => {
      this.setState({ nodes: this.sortFileList(await this.loadChildren('')) });
    })();
  }

  componentDidUpdate(prevProps: FileListUIProps) {
    if (JSON.stringify(prevProps.watchedFiles) !== JSON.stringify(this.props.watchedFiles)) {
      this.state.nodes.forEach(this.updateUserLabels);
      this.setState(this.state);
    }
  }

  render() {
    return (
      <div style={{ height: '100%', overflow: 'auto' }}>
        <Tree<ITreeNodeStateExtension>
          contents={this.state.nodes}
          onNodeClick={(node, nodePath) => {

          }}
          onNodeDoubleClick={(node, nodePath) => {
            if (!node.nodeData!.isDir) {
              this.props.openFile(node.nodeData!.path);
            }
          }}
          onNodeCollapse={(node, nodePath) => {
            node.isExpanded = false;
            node.icon = "folder-close";
            this.updateUserLabels(node);
            this.setState(this.state);
          }}
          onNodeExpand={async (node, nodePath) => {
            if (!node.childNodes) {
              node.childNodes = this.sortFileList(await this.loadChildren(node.nodeData!.path))
            }
            node.isExpanded = true;
            node.icon = "folder-open";
            this.updateUserLabels(node);
            this.setState(this.state);
          }}
          className={Classes.ELEVATION_0}
        />
      </div>
    );
  }
}
