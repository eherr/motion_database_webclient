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

  public projectList: any;
  public userList: any;
  public selectedProject: any;
  public selectedProjectUserList: any;
  public selectedUser: any;
  

  private activeTab: string = "tab1";
  private activeModal: string = "none";


  oppoRole: any = ['user', 'internal', 'admin']

  error = '';

  jobSubmitted = false;
  groupSubmitted = false;

  startJobForm: FormGroup;
  addProjectForm: FormGroup;
  editProjectForm: FormGroup;
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
    this.getProjectList();
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
    this.addProjectForm = this.formBuilder.group({
        projectName: ['', Validators.required],
        isPublic: ['']
    });
    this.editProjectForm = this.formBuilder.group({
        projectName: ['', Validators.required],
        projectMemberList: [''],
        isPublic: [''],
        userList: ['']
    });
    this.userTableForm = this.formBuilder.group({
        
    });

    
  }


  getProjectList(){
    this.dataService.getProjectList().subscribe(
      projectList => {this.projectList = projectList;}
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
  
  createProjectFromModal(modal: any){
    this.groupSubmitted = true;

    // stop here if form is invalid
    if (this.addProjectForm.invalid) {
        return;
    }
    modal.closeModal();
  
    this.dataService.createProject(this.addProjectForm.controls.projectName.value, this.addProjectForm.controls.isPublic.value);
  }
  
  
  openEditProjectModal(project: any){
    console.log("edit project modal");
    this.selectedProject = project
    this.activeModal = "editProject";
    this.selectedProjectUserList = []
    this.dataService.getProjectMemberList(project[0]).subscribe(
        projectUserList => {this.selectedProjectUserList = projectUserList;}
      );
    this.editProjectForm.controls.projectName.setValue(project[1]);
  }
  
  
  editProjectFromModal(modal: any){
    console.log("edit project");
    this.groupSubmitted = true;

    // stop here if form is invalid
    if (this.editProjectForm.invalid) {
        console.log("Form is invalid");
         return;
     }
    modal.closeModal();
    this.dataService.editProject(this.selectedProject[0], this.editProjectForm.controls.projectName.value, this.editProjectForm.controls.isPublic.value, this.selectedProjectUserList);
  }
  
  openDeleteProjectModal(group: any){
    console.log("open deleteProject model");
    this.selectedProject = group
    this.activeModal = "deleteProject";
  }

  openDeleteUserModal(user: any){
    console.log("open deleteUser model");
    this.selectedUser = user
    this.activeModal = "deleteUser";
  }
  

  ShowProjectList(){
    this.getProjectList();
    this.activeTab ='tab1';
  }
  ShowUserList(){
    this.getUserList();
    this.activeTab ='tab2';
  }
  
  addUserToProjectInModal(){
    let selected = this.editProjectForm.controls.userList.value;
    console.log("add user"+ selected);
    for (let newUser of selected){
        let addUser = true;
        for (let existingUser of this.selectedProjectUserList){
            if(newUser[0] == existingUser[0]){
                addUser = false;
                break;
            }
        }
        if(addUser){
            this.selectedProjectUserList.push(newUser);
        }
    }
  }
  
  removeUserFromProjectInModal(){
    let selectedUsers = this.editProjectForm.controls.projectMemberList.value;
    console.log("remove users"+selectedUsers);
    let newUserList = [];
    for (let user of this.selectedProjectUserList){
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
    this.selectedProjectUserList = newUserList;
  }

  changeUserRole(userID: string, event: any ){
      let role = this.userTableForm.get("user"+String(userID)).value;
      this.dataService.editUser(null, null, null, role, null, userID);
  }
  
}
