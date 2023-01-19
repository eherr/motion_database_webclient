import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataService } from '@app/_services/data.service';

import { environment } from '../../environments/environment';
import { User } from '../_models/user';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient,private dataService: DataService) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string) {
		
        let authenticateUrl = this.dataService.getServerURL() + "authenticate"
        return this.http.post<any>(authenticateUrl, { username, password })
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

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
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
