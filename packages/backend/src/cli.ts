import commander from "commander";
import {initApp} from "./init";
import {IServerSettings} from "./ServerSettings";

commander
  .version("0.1.0")
  .option("-p, --port [port]", "The port on which to run the server")
  .option("-k, --adminkey [key]", "This key can be used to register a user as an admin. Defaults to a random string.")
  .option("-d, --dir [dir]", "The project directory. Defaults to the current directory.")
  .parse(process.argv);

const settings: Partial<IServerSettings> = {
  projectPath: commander.dir,
  adminKey: commander.adminkey,
  port: commander.port
};

initApp(settings);
