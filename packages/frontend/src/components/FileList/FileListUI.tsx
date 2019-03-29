import * as React from "react";
import FileSystemService from "../../services/FileSystemService";
import {FileListUIProps} from "./FileList";
import {
  Classes,
  ContextMenuTarget, H4,
  Icon,
  IconName,
  ITreeNode,
  Menu,
  MenuDivider,
  MenuItem, Tag,
  Tooltip,
  Tree
} from "@blueprintjs/core";
import {IFileSystemPermissionData} from "../../types/permissions";
import {mergePathPermissions} from "../../utils/permissions";
import {FilesMenu} from "../menus/FilesMenu";
import {StoreProvider} from "../../index";

interface ITreeNodeStateExtension extends IFileSystemPermissionData {
  path: string;
  isDir: boolean;
  filename: string;
}

interface IFileListUIState {
  nodes: Array<ITreeNode<ITreeNodeStateExtension>>
}

@ContextMenuTarget
export class FileListUI extends React.Component<FileListUIProps, IFileListUIState> {
  state = {
    nodes: []
  };

  loadChildren = async (path: string): Promise<Array<ITreeNode<ITreeNodeStateExtension>>> => {
    const contents = (await FileSystemService.getDirectoryContents(path)).files;
    return contents.map(file => {
      const permission = this.props.getPathPermissions(file.path);

      const node: ITreeNode<ITreeNodeStateExtension> = {
        id: file.filename,
        hasCaret: file.isDir,
        label: file.filename,
        icon: (file.isDir ? "folder-close" : "document") as IconName,
        nodeData: {
          path: file.path,
          isDir: file.isDir,
          filename: file.filename,
          ...permission
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
      return node.isExpanded ? false : f.path.startsWith(node.nodeData!.path);
    });

    if (users.length === 0) {
      return undefined;
    }

    if (users.length > 3) {
      return (
        <>
          <Tooltip content={users.map(u => u.user.name).join(', ')}>
            <Tag>{ users.length }</Tag>
          </Tooltip>
        </>
      );
    }

    return (
      <>
        {
          users.map(u => (
            <div style={{ display: 'inline-block', marginRight: '5px' }}>
              <Tooltip content={u.user.name} key={u.user.id}>
                <Icon icon="eye-open" color={u.user.color.primaryColor} />
              </Tooltip>
            </div>
          ))
        }
      </>
    );
  };

  updateUserLabels = (node: ITreeNode<ITreeNodeStateExtension>) => {
    node.secondaryLabel = this.getUserLabels(node);
    if (node.childNodes) {
      node.childNodes.forEach(this.updateUserLabels);
    }
  };

  expandNode = async (node: ITreeNode<ITreeNodeStateExtension>) => {
    if (!node.childNodes) {
      node.childNodes = this.sortFileList(await this.loadChildren(node.nodeData!.path))
    }
    node.isExpanded = true;
    node.icon = "folder-open";
    this.updateUserLabels(node);
  };

  collapseNode = (node: ITreeNode<ITreeNodeStateExtension>) => {
    node.isExpanded = false;
    node.icon = "folder-close";
    this.updateUserLabels(node);
  };

  deselectNodes = (node: ITreeNode<ITreeNodeStateExtension>) => {
    node.isSelected = false;
    if (node.childNodes) {
      node.childNodes.forEach(this.deselectNodes);
    }
  };

  getSelectedPathsInNode = (node: ITreeNode<ITreeNodeStateExtension>): string[] => {
    let paths: string[] = [];

    if (node.isSelected) {
      paths.push(node.nodeData!.path);
    }

    if (node.childNodes) {
      node.childNodes.forEach(node => paths = [...paths, ...this.getSelectedPathsInNode(node)]);
    }

    return paths;
  };

  getAllSelectedPaths = (): string[] => {
    return this.state.nodes.map(this.getSelectedPathsInNode).reduce((a, b) => [...a, ...b], []);
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
            if (!(window.event && (window.event as any).ctrlKey)) {
              this.state.nodes.forEach(this.deselectNodes);
            }
            node.isSelected = !node.isSelected;
            this.setState(this.state);
          }}
          onNodeContextMenu={(node, nodePath) => {
            if (!(window.event && (window.event as any).ctrlKey) && !node.isSelected) {
              this.state.nodes.forEach(this.deselectNodes);
            }
            node.isSelected = true;
            this.setState(this.state);
          }}
          onNodeDoubleClick={async (node, nodePath) => {
            if (!node.nodeData!.isDir) {
              this.props.openFile(node.nodeData!.path);
            } else {
              if (node.isExpanded) {
                this.collapseNode(node);
              } else {
                await this.expandNode(node);
              }
              this.setState(this.state);
            }
          }}
          onNodeCollapse={(node, nodePath) => {
            this.collapseNode(node);
            this.setState(this.state);
          }}
          onNodeExpand={async (node, nodePath) => {
            await this.expandNode(node);
            this.setState(this.state);
          }}
        />
      </div>
    );
  }

  renderContextMenu() {
    const selectedPaths = this.getAllSelectedPaths();

    return (
      <StoreProvider>
        <FilesMenu paths={selectedPaths} />
      </StoreProvider>
    );
  }
}
