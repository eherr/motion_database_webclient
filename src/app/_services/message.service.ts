import { Injectable } from '@angular/core';

import '@assets/Unity/Build/UnityLoader.js';
import '@assets/Unity/TemplateData/UnityProgress.js';

declare var UnityLoader : any;
declare var UnityProgress : any;

@Injectable({
  providedIn: 'root'
})

export class MessageService {
  private gameInstance: any;
  private appLocation: string;

  constructor() { }

  public updateGameInstance(appLocation: string){
    this.appLocation = appLocation;
	
	/* https://stackoverflow.com/questions/47229867/prevent-emscripten-compiled-javascript-from-blocking-certain-key-inputs */
	//https://www.tangledrealitystudios.com/development-tips/prevent-unity-webgl-from-stopping-all-keyboard-input/
    //this.gameInstance = UnityLoader.instantiate("gameContainer", this.appLocation, {onProgress: UnityProgress});
    this.gameInstance = UnityLoader.instantiate("gameContainer", this.appLocation, {onProgress: UnityProgress});
  }

  public sendMessage(gameObject: string, functionName: string, paramValue?: any) {
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
