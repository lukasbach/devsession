import * as path from "path";

export const runserver = async (settings: object): Promise<object> => {
  const appPath = eval(`require('electron').remote.app`).getAppPath();
  console.log(appPath, path.join(appPath, 'backend', 'init.js'));
  const initApp = eval(`require('${path.join(appPath, '..', '..', 'backend', 'init.js')}').initApp`);

  const completeSettings = initApp(settings);

  return completeSettings;
};
