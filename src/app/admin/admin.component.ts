import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DataService } from '@app/_services/data.service';
import { UserService } from '@app/_services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { CollectionNode } from '../_models/collections';
import { Observable, of } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../_services/authentication.service';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.less'],
  host: {'class': 'padded-col fill-col', 'id': 'admin'}
})
export class AdminComponent implements OnInit {

  public serverList: any;
  public groupList: any;
  public userList: any;
  public selectedGroup: any;
  public selectedGroupUserList: any;
  public selectedUser: any;
  

  private activeTab: string = "tab1";
  private activeModal: string = "none";

  private currentServer: string;
  private currentServerName: string;

  oppoRole: any = ['user', 'internal', 'admin']

  error = '';

  jobSubmitted = false;
  groupSubmitted = false;

  startJobForm: FormGroup;
  addGroupForm: FormGroup;
  editGroupForm: FormGroup;
  userTableForm: FormGroup;

  constructor(private dataService: DataService,
              private formBuilder: FormBuilder,
              private router: Router,
              private authenticationService: AuthenticationService,
              private user : UserService) {
                
                // redirect to home if user is not an admin
                let _user = this.authenticationService.currentUserValue;
                let isAdmin = _user.role=='admin';
                if (!isAdmin) {
                  console.log("redirect");
                  console.log(_user.role);
                  this.router.navigate(['/']);
                }
              }

  ngOnInit() {
    this.getServerList();
    this.getGroupList();
    this.getUserList();
    this.initForms();
    
  }
  ngAfterInit() {
 
  }
  
  initForms(){
    this.startJobForm = this.formBuilder.group({
        serverName: ['', Validators.required],
        serverCmd: ['', Validators.required]
    });
    this.addGroupForm = this.formBuilder.group({
        groupName: ['', Validators.required]
    });
    this.editGroupForm = this.formBuilder.group({
        groupName: ['', Validators.required],
        groupMemberList: [''],
        userList: ['']
    });
    this.userTableForm = this.formBuilder.group({
        
    });

    
  }


  getServerList(){
    this.dataService.getServerList().subscribe(
        serverList => {this.serverList = serverList;}
      );
  }
  getGroupList(){
    this.dataService.getGroupList().subscribe(
        groupList => {this.groupList = groupList;}
      );
  }
  getUserList(){
    // fill dynamic form with user entries
    //https://www.technouz.com/4725/disable-angular-reactiveform-input-based-selection/
    this.dataService.getUserList().subscribe(
        userList => {
          this.userList = userList;
          //add dynamic select controls
          this.userList.forEach(user => {
            let key = 'user'+String(user[0]);
            let ctrl = this.formBuilder.control(key);
            //add custom properties
            ctrl["userID"] = user[0];
            ctrl["name"] = user[1];
            //get role
            this.dataService.getUserInfo(user[0]).subscribe(
                data => { 
                        if(data["success"]){
                            ctrl["role"] = String(data["role"]);
                            this.userTableForm.addControl(key, ctrl);
                            this.userTableForm.get(key).setValue(data["role"]);
                        }
              })
          })
        }
      );
  }
 
  callModal(modalName: string){
      this.activeModal = modalName;
  }

  resetSelection(){
    this.currentServer = null;
    this.serverList = [];
  }


  startJobFromModal(modal: any){
    this.jobSubmitted = true;

    // stop here if form is invalid
    if (this.startJobForm.invalid) {
        return;
    }
    modal.closeModal();
  
    this.dataService.startJob(this.startJobForm.controls.serverName.value,
                                  this.startJobForm.controls.serverCmd.value
                                  );
  }
  
  createGroupFromModal(modal: any){
    this.groupSubmitted = true;

    // stop here if form is invalid
    if (this.addGroupForm.invalid) {
        return;
    }
    modal.closeModal();
  
    this.dataService.createGroup(this.addGroupForm.controls.groupName.value);
  }
  
  
  openEditGroupModal(group: any){
    console.log("edit group model");
    this.selectedGroup = group
    this.activeModal = "editGroup";
    this.selectedGroupUserList = []
    this.dataService.getGroupMemberList(group[0]).subscribe(
        groupUserList => {this.selectedGroupUserList = groupUserList;}
      );
    this.editGroupForm.controls.groupName.setValue(group[1]);
  }
  
  
  editGroupFromModal(modal: any){
    console.log("edit group");
    this.groupSubmitted = true;

    // stop here if form is invalid
    if (this.editGroupForm.invalid) {
        console.log("Form is invalid");
         return;
     }
    modal.closeModal();
    this.dataService.editGroup(this.selectedGroup[0], this.editGroupForm.controls.groupName.value, this.selectedGroupUserList);
  }
  
  openDeleteGroupModal(group: any){
    console.log("open deleteGroup model");
    this.selectedGroup = group
    this.activeModal = "deleteGroup";
  }

  openDeleteUserModal(user: any){
    console.log("open deleteUser model");
    this.selectedUser = user
    this.activeModal = "deleteUser";
  }
  
  
  ShowServerList(){
    this.getServerList();
    this.activeTab ='tab1';
  }

  ShowGroupList(){
    this.getGroupList();
    this.activeTab ='tab2';
  }
  ShowUserList(){
    this.getUserList();
    this.activeTab ='tab3';
  }
  StartJob(name :string){
    console.log("start job");
    let cmd = "python none.py";
    this.dataService.startJob(name, cmd)
  }
  
  addUserToGroupInModal(){
    let selected = this.editGroupForm.controls.userList.value;
    console.log("add user"+ selected);
    for (let newUser of selected){
        let addUser = true;
        for (let existingUser of this.selectedGroupUserList){
            if(newUser[0] == existingUser[0]){
                addUser = false;
                break;
            }
        }
        if(addUser){
            this.selectedGroupUserList.push(newUser);
        }
    }
  }
  
  removeUserFromGroupInModal(){
    let selectedUsers = this.editGroupForm.controls.groupMemberList.value;
    console.log("remove users"+selectedUsers);
    let newUserList = [];
    for (let user of this.selectedGroupUserList){
        let removeUser = false;
        for(let idx in selectedUsers){
            if(selectedUsers[idx][0] == user[0]){
                console.log("remove user"+user[0]);
                removeUser = true;
                break;
            }
        }
        if(!removeUser){
            newUserList.push(user);
        }
    }
    this.selectedGroupUserList = newUserList;
  }

  changeUserRole(userID: string, event: any ){
      let role = this.userTableForm.get("user"+String(userID)).value;
      this.dataService.editUser(null, null, null, role, null, userID);
  }
  
}
