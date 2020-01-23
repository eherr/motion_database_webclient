import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { DataService } from './_services/data.service';
import { UserService } from './_services/user.service';

import { AuthenticationService } from './_services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'mosi-viewer';

  constructor(
    private titleService:Title,
    private meta:Meta,
    private router:Router,
    private activatedRoute:ActivatedRoute,
    private dataService:DataService,
    private userService:UserService,
    private authenticationService: AuthenticationService
  ){
    this.authenticationService.currentUser.subscribe(x => this.userService.currentUser = x);
  }

  ngOnInit():void{
    console.log(this.dataService.getServerURL());
    const appTitle = this.titleService.getTitle();
    this.router
      .events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          const child = this.activatedRoute.firstChild;
          if (child.snapshot.data['title']) {
            return appTitle + " - " + child.snapshot.data['title'];
          }
          return appTitle;
        })
      ).subscribe((ttl: string) => {
        this.titleService.setTitle(ttl);
      });

      // add meta tags
      this.getMetaInformation();
  }

  getMetaInformation(){
    this.dataService.getMetaInformation().subscribe(
      metaData => {
        this.meta.addTags([
            {name: 'connectionID', content: metaData['id']},
            {name: 'port', content: metaData['port']},
            {name: 'enableDownload', content: (metaData['enable_download'] ? '1' : '0')},
            {name: 'activatePortForwarding', content: ( metaData['activate_port_forwarding'] ? '1' : '0')}
        ]);
        console.log(metaData);
      }
    );
  }

}
