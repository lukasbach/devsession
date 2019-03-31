export interface IPortForwardingConfiguration {
  id: number;
  title: string;
  description?: string;
  service: "ngrok" | "localtunnel";
  protocol: "http" | "tcp" | "tls";
  addr: string | number;
  auth?: string;
  region?: "us" | "eu" | "au" | "ap";
  url?: string;
}
