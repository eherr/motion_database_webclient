import { Component, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from '../_services/data.service';
import { UserService } from '../_services/user.service';
import { MessageService } from '../_services/message.service';


@Component({
  selector: 'app-editable-row',
  templateUrl: './editable-row.component.html',
  styleUrls: ['./editable-row.component.less'],
  host: {'class': 'padded-col fill-col', 'id': 'editable-row'}
})
export class EditableRowComponent {

  @ViewChild('contentWrapper') contentWrapper: ElementRef;
  @ViewChild('renameButtonIcon') renameButtonIcon: ElementRef;
  @ViewChild('cancelRenameButton') cancelRenameButton: ElementRef;
  public allowEdit: boolean;
  
  public activeModal: string = "none";
  @Input() fileId: string = "";
  @Input() name: string = "";
  @Input() dataType: string = "";
  @Input() isPublic: boolean = false;
  @Input() enableDownload: boolean = false;

  @Output()  refreshEvent: EventEmitter<string> = new EventEmitter<string>();

  constructor(public dataService: DataService,
    public msgService: MessageService,
    public user: UserService) {
    this.allowEdit = false;
  }

  callModal(modalName: string){
    this.activeModal = modalName;
}
 openDeleteFileModal(name: string, id: string){
  this.callModal("deleteFile");
}

deleteFile(fileID:string){
  this.dataService.deleteFile(fileID).subscribe(
    (data:any)=>{
        this.refreshEvent.emit(fileID);
    }
  ); 
  
  }

  downloadFile(fileID: string, name: string, dataType: string){
    if(dataType== "motion"){
        this.dataService.downloadClipAsBVH(fileID, name);
    }else{
      this.dataService.downloadFile(fileID, name+"."+dataType);
    }
  }
  loadFileInViewer(fileID: string, name: string, dataType: string){
    this.messageUnityInstance("AnimationGUI", "GetMotionByID", fileID);
  }
  messageUnityInstance(gameObject: string, functionName: string, paramValue: any){
    this.msgService.sendMessage(gameObject, functionName, String(paramValue));
  }

  toggleEdit(){
    this.allowEdit = ! this.allowEdit;
    
    if(this.allowEdit) {
      this.renameButtonIcon.nativeElement.className = "fa-solid fa-check";
      this.cancelRenameButton.nativeElement.style.display = "block"
    }else{
      this.renameButtonIcon.nativeElement.className = "fas fa-edit";
      this.cancelRenameButton.nativeElement.style.display = "none"
      
      //this.contentWrapper.nativeElement.style.borderColor  = "transparent"
    }
    let newName = this.contentWrapper.nativeElement.textContent;
    if(!this.allowEdit && newName != this.name){
      console.log("referesh"+this.name + newName);
      this.dataService.replaceFile(this.fileId, undefined,undefined,newName).subscribe(
        ()=>{
          this.refreshEvent.emit(this.fileId);
        })
    }
      
  }
  cancelEdit(){
    this.allowEdit = false;
    this.renameButtonIcon.nativeElement.className = "fas fa-edit";
    this.cancelRenameButton.nativeElement.style.display = "none"
    this.contentWrapper.nativeElement.textContent = this.name;
    this.refreshEvent.emit(this.fileId);
  }

}
