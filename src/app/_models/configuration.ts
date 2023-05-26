
export class Configuration{
    public hostname: string = window.location.hostname;
    public protocol: string = window.location.protocol;
    public port: number = 8888;
    public activatePortForwarding: boolean = false;
    public enableDownload: boolean = true;
    public enableDataTransforms = false;
}