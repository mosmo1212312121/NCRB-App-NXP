import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { IAppState } from '../store/store';
import { BaseService } from './base.service';

const URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseService {
  constructor(private store: Store<IAppState>, private http: HttpClient) {
    super();
    this.setHttpCli(this.http);
  }

  public getRoles(
    page: number,
    pageLength: number,
    orderBy: string,
    orderFrom: string,
    startDate: string = null,
    endDate: string = null,
    searching: string = ''
  ) {
    return this.post(`/api/roles/Get`, {
      page,
      pageLength,
      orderBy,
      orderFrom,
      startDate,
      endDate,
      role: searching
    });
  }

  public deleteRole(id: string) {
    return this.delete(`/api/roles/Delete/${id}`);
  }
}
