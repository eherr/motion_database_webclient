import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DataService } from '../_services/data.service';
import { UserService } from '../_services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
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
  public addProjectSubmitted: boolean = false;
  public editProjectSubmitted: boolean = false;
  

  public activeTab: string = "tab1";
  public activeModal: string = "none";


  oppoRole: any = ['user', 'internal', 'admin']

  error = '';


  addProjectForm: FormGroup;
  editProjectForm: FormGroup;
  userTableForm: FormGroup;

  constructor(public dataService: DataService,
              public formBuilder: FormBuilder,
              public router: Router,
              public authenticationService: AuthenticationService,
              public user : UserService) {
                
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
    this.addProjectForm = this.formBuilder.group({
        projectName: ['', Validators.required],
        isPublic: ['']
    });
    this.editProjectForm = this.formBuilder.group({
        projectName: ['', Validators.required],
        isPublic: [''],
        projectMemberList: [''],
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
          this.userList.forEach((user: any) => {
            let key = 'user'+String(user[0]);
            let ctrl: any = this.formBuilder.control(key);
            this.userTableForm.addControl(key, ctrl);
          
          })
        }
      );
  }
 
  callModal(modalName: string){
      this.activeModal = modalName;
  }



  
  createProjectFromModal(modal: any){

    // stop here if form is invalid
    if (this.addProjectForm.invalid) {
        return;
    }
    modal.closeModal();
  
    this.dataService.createProject(this.addProjectForm.controls["projectName"].value, this.addProjectForm.controls["isPublic"].value);
  }
  
  
  openEditProjectModal(project: any){
    
    console.log("edit project modal");
    
    this.dataService.getProjectInfo(project[0]).subscribe(
      (projectInfo:any) => {
        
        this.selectedProject = project
        this.activeModal = "editProject";
        this.dataService.getProjectMemberList(project[0]).subscribe(
            projectUserList => {this.selectedProjectUserList = projectUserList;console.log(projectUserList);}
          );
        this.editProjectForm.controls["projectName"].setValue(project[1]);
        this.editProjectForm.controls["isPublic"].setValue(projectInfo["public"]);
      }
    )
  }
  
  
  editProjectFromModal(modal: any){
    this.editProjectSubmitted = true;
    console.log("edit project");
    // stop here if form is invalid
    if (this.editProjectForm.invalid) {
        console.log("Form is invalid");
         return;
     }
    modal.closeModal();
    
    this.editProjectSubmitted = false;
    this.dataService.editProject(this.selectedProject[0], this.editProjectForm.controls["projectName"].value, this.editProjectForm.controls["isPublic"].value, this.selectedProjectUserList);
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
    this.addProjectSubmitted = true;
    let selected = this.editProjectForm.controls["userList"].value;
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
    
    this.addProjectSubmitted = false;
  }
  
  removeUserFromProjectInModal(){
    let selectedUsers = this.editProjectForm.controls["projectMemberList"].value;
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
      let userData = this.userTableForm.get("user"+String(userID));
      if(userData == null) return;
      let role = userData.value;
      this.dataService.editUser("", "", "", role, null, userID);
  }
  
}
