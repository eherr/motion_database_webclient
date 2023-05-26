import { Injectable } from '@angular/core';
import '../../assets/Unity/Build/UnityLoader.js';
import {ConfigurationService} from '../_services/configuration.service';

declare var UnityLoader : any;

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  public gameInstance: any;
  public appLocation: string = "";

  constructor(private configService: ConfigurationService) {

  }
  
  public initGameInstance(appLocation: string){
    this.appLocation = appLocation;
	
    /* https://stackoverflow.com/questions/47229867/prevent-emscripten-compiled-javascript-from-blocking-certain-key-inputs 
      https://www.tangledrealitystudios.com/development-tips/prevent-unity-webgl-from-stopping-all-keyboard-input/*/
    let onProgress=(gameInstance: any, progress: any)=>{
        if (!gameInstance.Module)
          return;
          var length = 200 * Math.min(progress, 1);
          let bar = document.getElementById("progress-bar");
          if(bar){
            bar.style.width = length + "px";
          }
          let info = document.getElementById("loading-info");
          if(info){
            info.innerHTML = "Loading... " + (length/2) + "%";
          }
      
        if (progress == 1){
          let loading_box = document.getElementById("loading-box");
          if(loading_box){
            loading_box.style.display = "none";
          }
          let overlay = document.getElementById("loading-overlay");
          if(overlay){
            overlay.style.display = "none";
          }
          
          // Set the server url to be used by the unity client
          this.gameInstance.SendMessage("AnimationGUI", "SetPort", this.configService.config.port);
          if(this.configService.config.activatePortForwarding){
            this.gameInstance.SendMessage("AnimationGUI", "TogglePortWorkaround"); //changes the url to use a "/" instead of ":" when using the port
          }
          this.gameInstance.SendMessage("AnimationGUI", "SetProtocol", window.location.protocol.substring(0,  window.location.protocol.length - 1));
          this.gameInstance.SendMessage("AnimationGUI", "SetURL", window.location.hostname);
          this.gameInstance.SendMessage("AnimationGUI", "SetSourceSkeleton", "custom");//performs setup of skeleton
        }
      }

    this.gameInstance = UnityLoader.instantiate("gameContainer", this.appLocation, {onProgress: onProgress});
    
  }

  public sendMessage(gameObject: string, functionName: string, paramValue?: any) {
    if (this.gameInstance == undefined) return;
    if(paramValue == undefined){
      this.gameInstance.SendMessage(gameObject, functionName);
    }
    else{
      this.gameInstance.SendMessage(gameObject, functionName, paramValue);
    }

  }

  public setFullscreen(status: string){
      this.gameInstance.SetFullscreen(status);
  }
  
}
