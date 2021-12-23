import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { version } from '../../../package.json';
import { environment } from '../../environments/environment';
import { ResponseObj, User } from '../interfaces';
import { IAppState } from '../store/store';
import { mapping } from '../utils';

const URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  version: string = version;
  user: User = null;
  userSub: any = null;
  public maintain: boolean = false;
  constructor(private http: HttpClient, private store: Store<IAppState>) {
    this.userSub = this.store.pipe(select('user')).subscribe(user => {
      this.user = user;
    });
  }

  public disconnect() {
    this.userSub.unsubscribe();
  }

  public getAuth() {
    const auth: string = localStorage.getItem('basic_auth');
    return auth;
  }

  public login(username: string, password: string, auth?: string) {
    return this.http
      .post(`${URL ? URL : '/ncrb'}/api/flow/GetAuth`, {
        auth: `Basic ${window.btoa(unescape(encodeURIComponent(auth)))}`
      })
      .pipe(map(mapping));
  }

  public loginByAD(username: string, password: string) {
    return this.http
      .get(`https://thgbnklak1ms174.wbi.nxp.com/ldap/api/auth/GetAuth/${btoa(username)}/${btoa(password)}`)
      .pipe(map(mapping));
  }

  public getUserByAD(username: string) {
    return this.http.get(`https://thgbnklak1ms174.wbi.nxp.com/ldap/api/auth/GetUser/${username}`).pipe(map(mapping));
  }

  public loginNow(auth: string) {
    return this.http
      .post(`${URL ? URL : '/ncrb'}/api/flow/GetAuth`, {
        auth: `Basic ${window.btoa(unescape(encodeURIComponent(auth)))}`
      })
      .pipe(map(mapping));
  }

  public getVersion() {
    return this.http.get(`${URL ? URL : '/ncrb'}/api/flow/GetVersion`).pipe(map(mapping));
  }

  public getMaintain() {
    return this.http.get(`${URL ? URL : '/ncrb'}/api/flow/GetMaintain`).pipe(map(mapping));
  }

  public updateVersion(username: string, ver: string) {
    return this.http
      .post(`${URL ? URL : '/ncrb'}/api/flow/GetUpdateUserVersion`, { username, version: ver })
      .pipe(map(mapping));
  }

  public getCurrentUser(username: string) {
    const user: User = JSON.parse(localStorage.getItem('user'));
    if (user && user.expireIn && parseInt(user.expireIn.toString(), 10) > new Date().getTime()) {
      return new Observable<ResponseObj>(obs => {
        obs.next({
          data: user,
          status: 200,
          statusText: 'IN-STORAGE'
        });
        obs.complete();
      });
    } else {
      return this.http.post(`${URL ? URL : '/ncrb'}/api/hrms/GetCurrentUser/`, { username }).pipe(map(mapping));
    }
  }

  public async isMaintenance() {
    const response = await this.getMaintain().toPromise();
    return response.data === 'TRUE';
  }

  public isLoggedIn(): boolean {
    const user: User = JSON.parse(localStorage.getItem('user'));
    return user && user.empId !== 'empId';
  }

  public isAdmin(): boolean {
    const user: User = JSON.parse(localStorage.getItem('user'));
    return (
      user &&
      user.empId !== 'empId' &&
      user.roles &&
      user.roles.findIndex(obj => obj.toUpperCase() === 'ADMIN'.toUpperCase()) > -1
    );
  }

  public isDev(): boolean {
    const user: User = JSON.parse(localStorage.getItem('user'));
    return (
      user &&
      user.empId !== 'empId' &&
      user.roles &&
      user.roles.findIndex(obj => obj.toUpperCase() === 'DEV'.toUpperCase()) > -1
    );
  }

  public isManager(): boolean {
    const user: User = JSON.parse(localStorage.getItem('user'));
    return (
      user &&
      user.empId !== 'empId' &&
      user.roles &&
      user.roles.findIndex(obj => obj.toUpperCase() === 'MANAGER'.toUpperCase()) > -1
    );
  }
}
