import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigurationService } from '../_services/configuration.service';

import { User } from '../_models/user';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient,private configService: ConfigurationService) {
       let userData = localStorage.getItem('currentUser');
       let user : User = new User();
       if(userData != null) {
        let userDict = JSON.parse(userData);
         user.token = userDict["token"];
         user.username = userDict["username"];
         user.role = userDict["role"];
        }
        this.currentUserSubject = new BehaviorSubject<User>(user);
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string) {
		
        let authenticateUrl = this.configService.getServerURL() + "authenticate"
        return this.http.post<any>(authenticateUrl, { username, password })
            .pipe(map(user => {
                console.log("check response");
                console.log(user);
                if (user && user.token) {
                    // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                    console.log("success")
                }
                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        //this.currentUserSubject.next(null);//TODO FIX
        
    }

    reset_password(email: string) {
        let resetPasswordUrl = this.configService.getServerURL() + "users/reset_password"
        return this.http.post<any>(resetPasswordUrl, { email })
            .pipe(map(user => {
                if (user && user.token) {
                    // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                    console.log("success")
                }
                return user;
            }));
    }

    IsAdmin(){
        let user = this.currentUserSubject.value
        return user.token != null && user.role=='admin';
    }
    
    IsLoggedIn(){
        let user = this.currentUserSubject.value
        return user.token != null;
    }
}
