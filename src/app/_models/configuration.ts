
export class Configuration{
  public activatePortForwarding: boolean = false;
  public port: number = 8888;
  public hostname: string = window.location.hostname;
  public protocol: string = window.location.protocol;
}