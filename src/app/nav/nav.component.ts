import { Component } from '@angular/core';
import { DataService } from '../_services/data.service';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.less']
})
export class NavComponent {
  public enableDataTransforms: boolean = false;
  constructor(
    public userService:UserService,
    public dataService:DataService
  ) { 
    this.getMetaInformation();
  }

  
  getMetaInformation(){
    this.dataService.getMetaInformation().subscribe(
      (metaData:any) => {
        this.enableDataTransforms = metaData['enable_data_transforms']
      }
    );
  }
}
