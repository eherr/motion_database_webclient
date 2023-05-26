import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { DataService } from './_services/data.service';
import { UserService } from './_services/user.service';

import { AuthenticationService } from './_services/authentication.service';
import { ConfigurationService } from './_services/configuration.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'mosi-viewer';

  constructor(
    private userService:UserService,
    private authenticationService: AuthenticationService,
    private configService: ConfigurationService
  ){
    this.authenticationService.currentUser.subscribe(x => this.userService.currentUser = x);
  }

  ngOnInit():void{
      this.configService.updateConfiguration();
  }

 

}
