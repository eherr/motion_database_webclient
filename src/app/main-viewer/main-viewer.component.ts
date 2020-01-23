import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-main-viewer',
  templateUrl: './main-viewer.component.html',
  styleUrls: ['./main-viewer.component.less']
})
export class MainViewerComponent implements OnInit {
  @Input() enableEditing : boolean = false;

  constructor() { 
  
  }

  ngOnInit() {
  }

}
