import * as path from "path";

export const runserver = async (settings: object): Promise<object> => {
  return settings;

  const appPath = eval(`require('electron').remote.app`).getAppPath();
  const initApp = eval(`require('${path.join(appPath, 'backend', 'init.js')}').initApp`);

  const completeSettings = initApp(settings);

  return settings;
};
