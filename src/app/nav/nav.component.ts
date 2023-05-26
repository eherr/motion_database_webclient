import { Component } from '@angular/core';
import { UserService } from '../_services/user.service';
import { ConfigurationService } from '../_services/configuration.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.less']
})
export class NavComponent {
  constructor(
    public userService: UserService,
    public configService: ConfigurationService
  ) {
  }

  
}
