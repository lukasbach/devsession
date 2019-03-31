export interface IPortForwardingConfiguration {
  id: number;
  title: string;
  description?: string;
  protocol: "http" | "tcp" | "tls";
  addr: string | number;
  auth?: string;
  region?: "us" | "eu" | "au" | "ap";
  url?: string;
}
