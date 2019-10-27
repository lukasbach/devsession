import chalk from "chalk";
import commander from "commander";
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
  projectPath: settings.projectPath || process.cwd(),
  verbose: settings.verbose || false
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

  const routerResult = prepareRouters(socketServer, app, completedSettings);
  const closeRouters = routerResult.close;

  if (fs.existsSync(__dirname +  "/ui")) {
    console.log(`Serving UI.`);
    app.use(express.static(__dirname +  "/ui"));
  } else {
    console.error("UI content could not be found and will not be served.");
  }

  return new Promise((resolve, reject) => {
    server.listen(completedSettings.port, () => {
      const joinUrl = `http://localhost:${completedSettings.port}`;
      const adminUrl = `http://localhost:${completedSettings.port}/?adminkey=${completedSettings.adminKey}&setupServer=true`;

      console.log(`Using "${completedSettings.projectPath}" as project root.`);
      console.log(`${chalk.green("Server running at ")}${chalk.cyan(joinUrl)}`);
      console.log(`${chalk.green("Admin Join: ")}${chalk.cyan(adminUrl)}`);
      opn(adminUrl);

      resolve({
        ...completedSettings,
        close: () => {
          server.close();
          closeRouters();
        }
      });
    });
  });
};

export const initCli = async () => {
  commander
    .version("0.0.0")
    .option("-p, --port [port]", "The port on which to run the server. Defaults to 8020.")
    .option("-k, --adminkey [key]", "This key can be used to register a user as an admin. Defaults to a random string.")
    .option("-d, --dir [dir]", "The project directory. Defaults to the current directory.")
    .option("-v, --verbose", "Log all socket messages for debugging.")
    .parse(process.argv);

  const settings: Partial<IServerSettings> = {
    projectPath: commander.dir,
    adminKey: commander.adminkey,
    port: commander.port,
    verbose: commander.verbose
  };

  const { close } = await initApp(settings);

  process.stdin.resume();
  process.on("exit", close);
  process.on("SIGINT", close);
  process.on("SIGUSR1", close);
  process.on("SIGUSR2", close);
  process.on("uncaughtException", close);
};
