import * as ngrok from "ngrok";
import {IPortForwardingConfiguration} from "../../frontend/src/types/portforwarding";

export class PortForwardingService {
  private configurations: IPortForwardingConfiguration[];
  private configurationCounter: number = 0;

  public constructor() {
    this.configurations = [];
  }

  /**
   * Adds the config to the set of stored configs, sets an unique ID and returns the config with the newly
   * set id. This also starts the ngrok server and stores the ngrok url in the config.
   * @param config
   */
  public async createNewConfiguration(config: IPortForwardingConfiguration): Promise<IPortForwardingConfiguration> {
    config.id = this.configurationCounter++;
    config.title = config.title || `Portforwarding Port ${config.title}`;
    config.region = config.region || "us";
    this.configurations.push(config);

    config.url = await ngrok.connect({
      proto: config.protocol,
      addr: config.addr,
      auth: config.auth,
      region: config.region
    });

    return config;
  }

  public getConfig(id: number): IPortForwardingConfiguration | undefined {
    return this.configurations.find((c) => c.id === id);
  }

  public async deleteConfig(id: number): Promise<boolean> {
    const config = this.configurations.find((c) => c.id === id);

    if (!config) { return false; }

    try {
      await ngrok.disconnect(config.url);
    } catch (e) {
      console.error("Could not disconnect ngrok url because:");
      console.log(e);
    }

    this.configurations = this.configurations.filter((c) => c.id !== id);

    return true;
  }

}
