import {restMessage} from "../utils/rest";

export default class FileSystemService {
  public static async getDirectoryContents(path: string): Promise<{
    files: Array<{
      path: string;
      filename: string;
      isDir: boolean;
    }>
  }> {
    return await restMessage('/editor/dir',  'GET', { path });
  }

  public static async getFileContents(path: string): Promise<{
    path: string,
    fileName: string,
    contents: string
  }> {
    return await restMessage('/editor/contents',  'GET', { path });
  }
}