import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Parameter } from '../interfaces';
import { IAppState } from '../store/store';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class ParameterService extends BaseService {
  constructor(private store: Store<IAppState>, private http: HttpClient) {
    super();
    this.setHttpCli(this.http);
  }

  public createParameter(parameter: Parameter) {
    return this.post(`/api/admin/CreateParameter`, parameter);
  }

  public deleteParameter(id: number) {
    return this.delete(`/api/admin/DeleteParameter/${id}`);
  }

  public updateParameter(parameter: Parameter) {
    return this.post(`/api/admin/UpdateParameter`, parameter);
  }

  public getParameters() {
    return this.get(`/api/admin/GetParameters`);
  }

  public getParameter(id: number) {
    return this.get(`/api/admin/GetParameter/${id}`);
  }

  public getParameterByLabel(label: string) {
    return this.get(`/api/admin/GetParameterByLabel/${label}`);
  }
}
