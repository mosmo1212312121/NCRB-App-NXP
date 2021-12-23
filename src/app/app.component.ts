import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Initial } from './interfaces';
import { AjaxService, AuthService } from './services';

@Component({
  // tslint:disable-next-line
  selector: 'body',
  template: `
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  request: Initial;
  routerSub: any = null;
  constructor(private router: Router, private ajax: AjaxService, private auth: AuthService) {}

  ngOnInit() {
    this.routerSub = this.router.events.subscribe(evt => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

  ngOnDestroy() {
    this.routerSub.unsubscribe();
  }
}
