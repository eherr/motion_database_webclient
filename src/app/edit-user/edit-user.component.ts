import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { first } from 'rxjs/operators';
import { DataService } from '../_services/data.service';
import { MessageService } from '../_services/message.service';

import { AuthenticationService } from '../_services/authentication.service';

function passwordConfirming(c: AbstractControl): { passwordsNoMatch: boolean } {
    let pw = c.get('password');
    let rpw = c.get('repeatPassword');
    if (pw != null && rpw!= null && pw.value !== rpw.value) {
        return {passwordsNoMatch: true};
    }else{
      return {passwordsNoMatch: false};
    }
}

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.less']
})
export class EditUserComponent implements OnInit {
    editUserForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string = "";
    error = '';
    unamePattern = "^[A-Za-z0-9_-]{2,15}$";
    pwdPattern = "^(?=.*[a-z])(?=.*\\d)[A-Za-z\\d!$%@#£€*?&]{6,}$";
    emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
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
        this.editUserForm = this.formBuilder.group({
            
          username: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(this.unamePattern)]],
          email: ['', [Validators.required, Validators.email, Validators.maxLength(45), Validators.pattern(this.emailPattern)]],
          password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(25), Validators.pattern(this.pwdPattern)]],
          repeatPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(25), Validators.pattern(this.pwdPattern)]]
      },{validator: passwordConfirming});
   
    }

    ngOnInit() {
		

		// disable camera because the canvas is now hidden
		// it is automatically reactivated when the object is reloaded
		this.messageService.sendMessage("AnimationGUI","DisableCamera");
		
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        
        //this.editUserForm.controls.username.value = data.username;
        // console.log("user"+data.username);

        this.dataService.getUserInfo("").subscribe(
            (data:any) => { if(data["success"]){
                            console.log(data);
                            this.editUserForm.controls["username"].setValue(data["name"]);
                            this.editUserForm.controls["email"].setValue(data["email"]);
                            console.log("success");
                            console.log("set"+data["name"]);
                            console.log("set"+data["email"]);
                        }else{
                            console.log("error");
                            console.log(data);
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
		if(this.f["password"].value != this.f["repeatPassword"].value){
			console.log("Passwords do not match");
			return;
		}
        this.loading = true;
        this.dataService.editUserPipe(this.f["username"].value, this.f["password"].value, this.f["email"].value, "", null, "")
            .pipe(first())
            .subscribe(
                (data: any) => {
                    this.router.navigate([this.returnUrl]);
                },
                error => {
					
                    this.error = error;
                    this.loading = false;
                });
    }
    
  
}
