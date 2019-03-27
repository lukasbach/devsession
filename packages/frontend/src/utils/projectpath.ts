import * as path from "path";

export const normalizeProjectPath = (projectPath: string) => {
  projectPath = projectPath || "root";
  projectPath = projectPath.replace(/\\/g, "/");

  if (!projectPath.startsWith("root")) {
    projectPath = `root/${projectPath}`;
  }

  projectPath = path.normalize(projectPath);

  return projectPath;
};

export const getActualPathFromNormalizedPath = (normalizedPath: string) => {
  normalizedPath = normalizeProjectPath(normalizedPath);
  const [root, ...rest] = normalizedPath.split(path.sep);
  return rest.join(path.sep);
};
