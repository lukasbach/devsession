export const runserver = async (settings: object): Promise<object> => {
  // Use eval to force webpack to not include dependency
  return eval(`require('@devsession/backend')`).initApp(settings);
};
