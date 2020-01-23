import { Component, OnInit, Input } from '@angular/core';
import { MessageService } from '../_services/message.service';

@Component({
  selector: 'app-game-window',
  templateUrl: './game-window.component.html',
  styleUrls: ['./game-window.component.less']
})
export class GameWindowComponent implements OnInit {

  @Input() appLocation: string;
  @Input() appWidth: string;
  @Input() appHeight: string;

  constructor(public msgService : MessageService) { }

  ngOnInit() {
    this.msgService.updateGameInstance(this.appLocation);
  }

}
