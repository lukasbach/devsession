import chalk from "chalk";
import cors from "cors";
import express from "express";
import * as fs from "fs";
import * as http from "http";
// @ts-ignore
import opn from "opn";
import io, {Server} from "socket.io";
import socketIoWildCardMiddleware from "socketio-wildcard";
import uuidv4 from "uuid/v4";
import {prepareRouters} from "./routersCollector";
import {IServerSettings} from "./ServerSettings";

const completeSettings = (settings: Partial<IServerSettings>): IServerSettings => ({
  port: settings.port || 8020,
  adminKey: settings.adminKey || uuidv4(),
  projectPath: settings.projectPath || process.cwd()
});

export const initApp = async (settings: Partial<IServerSettings>): Promise<IServerSettings & {close: () => void} > => {
  const completedSettings = completeSettings(settings);

  const app = express();
  const server = http.createServer(app);
  app.use(cors());

  const socketServer = io(server, {
    origins: "*:*"
  });

  socketServer.use(socketIoWildCardMiddleware());

  prepareRouters(socketServer, app, completedSettings);

  if (fs.existsSync(__dirname +  "/ui")) {
    console.log(`Serving UI.`);
    app.use(express.static(__dirname +  "/ui"));
  } else {
    console.error("UI content could not be found and will not be served.");
  }

  return new Promise((resolve, reject) => {
    server.listen(completedSettings.port, () => {
      const joinUrl = `http://localhost:${completedSettings.port}`;
      const adminUrl = `http://localhost:${completedSettings.port}/?adminkey=${completedSettings.adminKey}`;

      console.log(`Using "${completedSettings.projectPath}" as project root.`);
      console.log(`${chalk.green("Server running at ")}${chalk.cyan(joinUrl)}`);
      console.log(`${chalk.green("Admin Join: ")}${chalk.cyan(adminUrl)}`);
      opn(adminUrl);

      resolve({
        ...completedSettings,
        close: () => server.close()
      });
    });
  });
};
