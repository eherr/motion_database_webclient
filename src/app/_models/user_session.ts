/*
 * Basic auth class 
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '@app/_services/data.service';

@Injectable({ providedIn: 'root' })
export class UserSession {
    public username: string;
    public token: string;
    
    constructor(private http: HttpClient,private dataService: DataService) {
        let data =  JSON.parse(localStorage.getItem('currentSession'));
        this.username = data.user;
        this.token = data.token;
    }
    
    login(username: string, password: string) {
		
        let authenticateUrl = this.dataService.getServerURL() + "authenticate"
        return this.http.post<UserSession>(authenticateUrl, { username, password })
            .pipe(result => {
                if (result) { //result.token
                    // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
                    result["username"] = username;
                    localStorage.setItem('currentSession', JSON.stringify(result));
                    console.log("success")
                }
                return result;
            });
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentSession');
    }
}
