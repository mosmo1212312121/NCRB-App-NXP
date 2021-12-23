import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Menu } from '../interfaces';
import { IAppState } from '../store/store';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService extends BaseService {
  constructor(private store: Store<IAppState>, private http: HttpClient) {
    super();
    this.setHttpCli(this.http);
  }

  getMenus() {
    return this.get(`/api/menu/all`);
  }

  saveMenus(menus: Menu[]) {
    return this.post(`/api/menu/save`, menus);
  }
}
