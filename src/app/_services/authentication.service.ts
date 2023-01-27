import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataService } from '../_services/data.service';

import { User } from '../_models/user';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient,private dataService: DataService) {
       let userData = localStorage.getItem('currentUser');
       if(userData == null) return;
        let userDict = JSON.parse(userData);
         let user : User = new User();
         user.token = userDict["token"];
         user.username = userDict["username"];
         user.role = userDict["role"];
        this.currentUserSubject = new BehaviorSubject<User>(user);
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string) {
		
        let authenticateUrl = this.dataService.getServerURL() + "authenticate"
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
        let resetPasswordUrl = this.dataService.getServerURL() + "users/reset_password"
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
}
