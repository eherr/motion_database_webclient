import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { MessageService } from '../_services/message.service';

import { AuthenticationService } from '../_services/authentication.service';

@Component({
  selector: 'app-user-password-reset',
  templateUrl: './user-password-reset.component.html',
  styleUrls: ['./user-password-reset.component.less']
})
export class UserPasswordResetComponent implements OnInit {
    resetForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    error = '';
    unamePattern = "^[A-Za-z0-9_-]{2,15}$";
    emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
		private messageService: MessageService
    ) {
        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue) {
            this.router.navigate(['/']);
        }
		// disable camera because the canvas is now hidden
		// it is automatically reactivated when the object is reloaded
		this.messageService.sendMessage("AnimationGUI","DisableCamera");
    }

    ngOnInit() {
		
        this.resetForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email, Validators.maxLength(45), Validators.pattern(this.emailPattern)]]
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // convenience getter for easy access to form fields
    get f() { return this.resetForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.resetForm.invalid) {
            return;
        }

        this.loading = true;
        this.authenticationService.reset_password(this.f["email"].value)
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
}
