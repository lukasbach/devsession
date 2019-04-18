import {restMessage} from "@devsession/common/src/utils/rest";
import {normalizeProjectPath} from "@devsession/common/src/utils/projectpath";

export default class FileSystemService {
  public static async getDirectoryContents(path: string): Promise<{
    files: Array<{
      path: string;
      filename: string;
      isDir: boolean;
    }>
  }> {
    path = normalizeProjectPath(path);
    return await restMessage('/editor/dir',  'GET', { path });
  }

  public static async getFileContents(path: string): Promise<{
    path: string,
    fileName: string,
    contents: string
  }> {
    path = normalizeProjectPath(path);
    return await restMessage('/editor/contents',  'GET', { path });
  }
}