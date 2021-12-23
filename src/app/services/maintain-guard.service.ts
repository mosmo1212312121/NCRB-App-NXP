import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MaintainGuardService implements CanActivate {
  constructor(public auth: AuthService, public router: Router) {}
  canActivate(): boolean | Promise<boolean> {
    return new Promise(async (res, rej) => {
      if (await this.auth.isMaintenance()) {
        this.router.navigate(['maintenance']);
        res(false);
      }
      res(true);
    });
  }
}
