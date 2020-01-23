import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.less']
})
export class ModalComponent implements OnInit {
  @Input() title: string;
  @Input() slug: string;
  @Input() isActive: boolean = false;

  @Output() modalCall = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  closeModal(){
    // TODO: clear forms?
    this.modalCall.emit("none");
  }

}
