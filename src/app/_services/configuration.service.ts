import { Injectable } from '@angular/core';
import {Configuration} from '../_models/configuration';
import { User } from '../_models/user';
import { HttpClient } from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class ConfigurationService {
    public config: Configuration;

    constructor(private http: HttpClient){
        this.config = new Configuration();
    }

    public getServerURL(): string{
        if(this.config.activatePortForwarding){
          return this.config.protocol + "//" + this.config.hostname + "/" + this.config.port;
        }
        else{
          return this.config.protocol + "//" + this.config.hostname + ":" + this.config.port + "/";
        }
    }

    public getUser(): User{
        let userData = localStorage.getItem('currentUser');
        let user : User = new User();
        if(userData == null) return user;
        let userDict = JSON.parse(userData);
        user.token = userDict["token"];
        user.username = userDict["username"];
        user.role = userDict["role"];
        return user;
    }
    
   public updateConfiguration(){
    this.http.post(this.getServerURL() + "get_meta_data", null).subscribe(
      (config: any) => {
        this.config.enableDownload = config['enable_download'];
        this.config.activatePortForwarding = config['activate_port_forwarding'];
        this.config.enableDataTransforms = config['enable_data_transforms']
      }
    );
  }
}
