export interface IErrorInformation {
  id?: string;
  errortype: "user" | "server";
  title: string;
  message?: string[];
  data?: object;
}
