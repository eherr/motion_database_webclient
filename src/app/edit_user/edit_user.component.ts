import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { first } from 'rxjs/operators';
import { DataService } from '@app/_services/data.service';
import { MessageService } from '@app/_services/message.service';

import { AuthenticationService } from '../_services/authentication.service';

function passwordConfirming(c: AbstractControl): { passwordsNoMatch: boolean } {
    if (c.get('password').value !== c.get('repeatPassword').value) {
        return {passwordsNoMatch: true};
    }
}

@Component({
  selector: 'app-edit_user',
  templateUrl: './edit_user.component.html',
  styleUrls: ['./edit_user.component.less']
})
export class EditUserComponent implements OnInit {
    editUserForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    error = '';
    unamePattern = "^[A-Za-z0-9_-]{2,15}$";
    pwdPattern = "^(?=.*[a-z])(?=.*\\d)[A-Za-z\\d!$%@#£€*?&]{6,}$";
    emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
    public projectList: any;
    public userProjectList: any;
    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private dataService: DataService,
		private messageService: MessageService
    ) {
        // redirect to home if not already logged in
        if (!this.authenticationService.currentUserValue) {
            this.router.navigate(['/']);
        }
   
    }

    ngOnInit() {
		
        this.editUserForm = this.formBuilder.group({
            
            username: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(this.unamePattern)]],
            email: ['', [Validators.required, Validators.email, Validators.maxLength(45), Validators.pattern(this.emailPattern)]],
            password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(25), Validators.pattern(this.pwdPattern)]],
            repeatPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(25), Validators.pattern(this.pwdPattern)]],
            projectList: [''],
            userProjectList: ['']
        },{validator: passwordConfirming});
		// disable camera because the canvas is now hidden
		// it is automatically reactivated when the object is reloaded
		this.messageService.sendMessage("AnimationGUI","DisableCamera");
		
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        
        let data =  JSON.parse(localStorage.getItem('currentUser'));
        //this.editUserForm.controls.username.value = data.username;
        // console.log("user"+data.username);

        this.userProjectList = []
        this.dataService.getUserInfo(null).subscribe(
            data => { if(data["success"]){
                            console.log(data);
                            this.editUserForm.controls.username.setValue(data["name"]);
                            this.editUserForm.controls.email.setValue(data["email"]);
                            console.log("success");
                            console.log("set"+data["name"]);
                            console.log("set"+data["email"]);
                        }else{
                            console.log("error");
                            console.log(data);
                        }
            }
          );
          
        this.dataService.getProjectList().subscribe(
                projectList => {this.projectList = projectList;}
                );
        
        this.dataService.getUserProjectList(data["user_id"]).subscribe(
                data => {  if(data["success"] ) {
                                    this.userProjectList = data["project_list"];
                                }else{
                                    console.log("error getting project list");
                                    }
                            }
                    );
    }

    // convenience getter for easy access to form fields
    get f() { return this.editUserForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.editUserForm.invalid) {
            console.log("Form is invalid");
            return;
        }
		if(this.f.password.value != this.f.repeatPassword.value){
			console.log("Passwords do not match");
			return;
		}
        let role = "";
        let user_projects = this.userProjectList;
        this.loading = true;
        this.dataService.editUserPipe(this.f.username.value, this.f.password.value, this.f.email.value, role, user_projects, null)
            .pipe(first())
            .subscribe(
                data => {
                    this.router.navigate([this.returnUrl]);
                },
                error => {
					
                    this.error = error;
                    this.loading = false;
                });
    }
    
    
    
  addProject(){
    let selected = this.editUserForm.controls.projectList.value;
    console.log("add group"+ selected);
    for (let newProject of selected){
        let addProject = true;
        for (let existingUser of this.userProjectList){
            if(newProject[0] == existingUser[0]){
                addProject = false;
                break;
            }
        }
        if(addProject){
            this.userProjectList.push(newProject);
        }
    }
  }
  
  removeProject(){
    let selectedProjects = this.editUserForm.controls.userProjectList.value;
    console.log("remove groups"+selectedProjects);
    let newProjectList = [];
    for (let group of this.userProjectList){
        let removeProject = false;
        for(let idx in selectedProjects){
            if(selectedProjects[idx][0] == group[0]){
                console.log("remove group"+group[0]);
                removeProject = true;
                break;
            }
        }
        if(!removeProject){
            newProjectList.push(group);
        }
    }
    this.userProjectList = newProjectList;
  }
}
