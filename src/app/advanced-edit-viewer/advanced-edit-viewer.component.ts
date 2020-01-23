import { Component, OnInit } from '@angular/core';
import { MessageService } from '@app/_services/message.service';

@Component({
  selector: 'app-advanced-edit-viewer',
  templateUrl: './advanced-edit-viewer.component.html',
  styleUrls: ['./advanced-edit-viewer.component.less']
})
export class AdvancedEditViewerComponent implements OnInit {

  constructor(private messageService: MessageService) { 
  
		// disable camera because the canvas is now hidden
		// it is automatically reactivated when the object is reloaded
		this.messageService.sendMessage("AnimationGUI","DisableCamera");
  }

  ngOnInit() {
  }

}
