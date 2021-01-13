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
    public groupList: any;
    public userAccessGroupList: any;
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
            groupList: [''],
            userAccessGroupList: ['']
        },{validator: passwordConfirming});
		// disable camera because the canvas is now hidden
		// it is automatically reactivated when the object is reloaded
		this.messageService.sendMessage("AnimationGUI","DisableCamera");
		
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        
        let data =  JSON.parse(localStorage.getItem('currentUser'));
        //this.editUserForm.controls.username.value = data.username;
        // console.log("user"+data.username);

        this.userAccessGroupList = []
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
          
        this.dataService.getGroupList().subscribe(
                groupList => {this.groupList = groupList;}
                );
        
        this.dataService.getUserAccessGroupList(data["user_id"]).subscribe(
                groupData => {  if(groupData["success"] ) {
                                    this.userAccessGroupList = groupData["group_list"];
                                }else{
                                    console.log("error getting group list");
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
        let shared_access_groups = this.userAccessGroupList;
        this.loading = true;
        this.dataService.editUserPipe(this.f.username.value, this.f.password.value, this.f.email.value, role, shared_access_groups, null)
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
    
    
    
  addGroupAccess(){
    let selected = this.editUserForm.controls.groupList.value;
    console.log("add group"+ selected);
    for (let newGroup of selected){
        let addGroup = true;
        for (let existingUser of this.userAccessGroupList){
            if(newGroup[0] == existingUser[0]){
                addGroup = false;
                break;
            }
        }
        if(addGroup){
            this.userAccessGroupList.push(newGroup);
        }
    }
  }
  
  removeGroupAccess(){
    let selectedGroups = this.editUserForm.controls.userAccessGroupList.value;
    console.log("remove groups"+selectedGroups);
    let newGroupList = [];
    for (let group of this.userAccessGroupList){
        let removeGroup = false;
        for(let idx in selectedGroups){
            if(selectedGroups[idx][0] == group[0]){
                console.log("remove group"+group[0]);
                removeGroup = true;
                break;
            }
        }
        if(!removeGroup){
            newGroupList.push(group);
        }
    }
    this.userAccessGroupList = newGroupList;
  }
}
