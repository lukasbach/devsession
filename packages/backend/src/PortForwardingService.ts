// @ts-ignore
import localtunnel from "localtunnel";
import * as ngrok from "ngrok";
import {IPortForwardingConfiguration} from "../../frontend/src/types/portforwarding";

export class PortForwardingService {
  private configurations: IPortForwardingConfiguration[];
  private configurationCounter: number = 0;
  private localTunnelCloseHandlers: {[configId: string]: () => void};

  public constructor() {
    this.configurations = [];
    this.localTunnelCloseHandlers = {};
    (async () => await ngrok.kill())();
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

    if (config.service === "ngrok") {
      config.url = await ngrok.connect({
        proto: config.protocol,
        addr: config.addr,
        auth: config.auth,
        region: config.region
      });
    } else if (config.service === "localtunnel") {
      const tunnel = await new Promise((res, rej) => {
        localtunnel(config.addr, (err: any, tun: any) => {
          if (err) {
            rej(err);
          } else {
            res(tun);
          }
        });
      });
      config.url = (tunnel as any).url;
      this.localTunnelCloseHandlers[config.id] = () => (tunnel as any).close();
    }

    this.configurations.push(config);

    return config;
  }

  public getConfig(id: number): IPortForwardingConfiguration | undefined {
    return this.configurations.find((c) => c.id === id);
  }

  public getAllConfigs(): IPortForwardingConfiguration[] {
    return this.configurations;
  }

  public async deleteConfig(id: number): Promise<boolean> {
    const config = this.configurations.find((c) => c.id === id);

    if (!config) { return false; }

    try {
      if (config.service === "ngrok") {
        await ngrok.disconnect(config.url);
      } else if (config.service === "localtunnel") {
        this.localTunnelCloseHandlers[config.id]();
      }
    } catch (e) {
      throw Error(`Port Forwarding Config could not be deleted because: ${e.message}`);
    }

    this.configurations = this.configurations.filter((c) => c.id !== id);

    return true;
  }

}
