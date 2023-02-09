import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';
import { User } from '../_models/user';

import { AuthenticationService } from '../_services/authentication.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class UserService {
    public currentUser: User;

    constructor(
      private http: HttpClient,
      private router:Router,
      private authenticationService: AuthenticationService
    ) { 
        this.currentUser = new User();
    }

    getAll() {
        return this.http.get<User[]>(`${environment.apiUrl}/users`);
    }

    logout() {
        this.authenticationService.logout();
        this.router.navigate(['/']);
    }
    
    IsAdmin(){
        return this.currentUser.token != null && this.currentUser.role=='admin';
    }
    
    IsLoggedIn(){
        return this.currentUser.token != null;
    }
}
