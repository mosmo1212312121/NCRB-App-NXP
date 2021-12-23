import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ResponseObj } from '../interfaces';
import { IAppState } from '../store/store';
import { BaseService } from './base.service';
import * as moment from 'moment';

const URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class DropdownService extends BaseService {
  constructor(private store: Store<IAppState>, private http: HttpClient) {
    super();
    this.setHttpCli(this.http);
  }

  /**
   *
   * @param id
   * @param fromServer
   * @returns
   */
  public getDropdownRejectById(id: number, fromServer?: boolean) {
    return this.get(`/api/admin/GetRejectName/${id}`);
  }

  /**
   *
   * @param fromServer
   * @returns
   */
  public getDropdownReject(fromServer?: boolean): Observable<ResponseObj> {
    const rejectNames = JSON.parse(localStorage.getItem('rejectNames'));
    if (rejectNames && !fromServer) {
      return new Observable<ResponseObj>(obs => {
        obs.next({ data: rejectNames, status: 200, statusText: 'OK', timing: 0.0 });
        obs.complete();
      });
    } else {
      return this.get(`/api/admin/GetRejectName`).pipe(map(this.handleMapRejectNames));
    }
  }

  /**
   *
   * @param id
   * @returns
   */
  public getDropdownMaterialById(id: number) {
    const materialTypes = JSON.parse(localStorage.getItem('materialTypes'));
    if (materialTypes && !this.isExpired()) {
      return new Observable<ResponseObj>(obs => {
        obs.next({ data: materialTypes.find(obj => obj.id === id), status: 200, statusText: 'OK', timing: 0.0 });
        obs.complete();
      });
    } else {
      return this.get(`/api/admin/GetMaterialType/${id}`);
    }
  }

  /**
   *
   * @returns
   */
  public getDropdownMaterial() {
    const materialTypes = JSON.parse(localStorage.getItem('materialTypes'));
    if (materialTypes && !this.isExpired()) {
      return new Observable<ResponseObj>(obs => {
        obs.next({ data: materialTypes, status: 200, statusText: 'OK', timing: 0.0 });
        obs.complete();
      });
    } else {
      return this.get(`/api/admin/GetMaterialType`).pipe(map(this.handleMapMaterialTypes));
    }
  }

  /**
   *
   * @param forceUpdate
   * @returns
   */
  public getDropdowns(forceUpdate: boolean = false) {
    return this.get(`/api/admin/GetDropdowns`).pipe(map(this.handleMapDropdowns));
  }

  /**
   *
   * @param parentId
   * @returns
   */
  public getDropdownByParent(parentId: string) {
    const dropdowns = JSON.parse(localStorage.getItem('dropdowns'));
    if (dropdowns && !this.isExpired()) {
      return new Observable<ResponseObj>(obs => {
        obs.next({
          data: dropdowns.filter(obj => parseInt(obj.parentId, 10) === parseInt(parentId, 10)),
          status: 200,
          statusText: 'OK',
          timing: 0.0
        });
        obs.complete();
      });
    } else {
      return this.get(`/api/admin/GetDropdownByParent/${parentId}`);
    }
  }

  /**
   *
   * @param id
   * @returns
   */
  public getDropdownById(id: number) {
    const dropdowns = JSON.parse(localStorage.getItem('dropdowns'));
    if (dropdowns && !this.isExpired()) {
      return new Observable<ResponseObj>(obs => {
        obs.next({
          data: dropdowns.find(obj => parseInt(obj.id, 10) === id),
          status: 200,
          statusText: 'OK',
          timing: 0.0
        });
        obs.complete();
      });
    } else {
      return this.get(`/api/admin/GetDropdown/${id}`);
    }
  }

  /**
   *
   * @param groupName
   * @returns
   */
  public getDropdownByGroup(groupName: string) {
    const dropdowns = JSON.parse(localStorage.getItem('dropdowns'));
    if (dropdowns && !this.isExpired()) {
      return new Observable<ResponseObj>(obs => {
        obs.next({
          data: dropdowns.filter(obj => obj.groupName === groupName),
          status: 200,
          statusText: 'OK',
          timing: 0.0
        });
        obs.complete();
      });
    } else {
      return this.get(`/api/admin/GetDropdownByGroup/${groupName}`);
    }
  }

  /**
   *
   * @param parentId
   * @param groupName
   * @returns
   */
  public getDropdown(parentId: string, groupName: string) {
    const dropdowns = JSON.parse(localStorage.getItem('dropdowns'));
    if (dropdowns && !this.isExpired()) {
      return new Observable<ResponseObj>(obs => {
        obs.next({
          data: dropdowns.filter(
            obj => obj.groupName === groupName && parseInt(obj.parentId, 10) === parseInt(parentId, 10)
          ),
          status: 200,
          statusText: 'OK',
          timing: 0.0
        });
        obs.complete();
      });
    } else {
      return this.get(`/api/admin/GetDropdown/${parentId}/${groupName}`);
    }
  }

  /**
   *
   * @param rescreen
   * @returns
   */
  public isRetest(rescreen: string): boolean {
    const retests: string[] = ['8', '7', '6', '5'];
    return retests.findIndex(obj => obj === rescreen) > -1;
  }

  /**
   *
   * @param id
   * @returns
   */
  public removeDropdown(id: string) {
    return this.delete(`/api/admin/DeleteDropdown/${id}`);
  }

  /**
   *
   * @param data
   * @returns
   */
  public createDropdown(data: any) {
    return this.post(`/api/admin/CreateDropdown`, data);
  }

  /**
   *
   * @param response
   * @returns
   */
  private handleMapDropdowns = (response: ResponseObj) => {
    let dropdowns = [];
    if (this.isExpired()) {
      // expired in 2 weeks
      localStorage.setItem(
        'expired',
        moment()
          .add(14, 'days')
          .format('YYYYMMDDHHmm')
      );
      localStorage.setItem('dropdowns', JSON.stringify(response.data));
    } else {
      dropdowns = JSON.parse(localStorage.getItem('dropdowns'));
    }
    return response;
  };

  /**
   *
   * @param response
   * @returns
   */
  private handleMapMaterialTypes = (response: ResponseObj) => {
    const materialTypes = JSON.parse(localStorage.getItem('materialTypes'));
    if (!materialTypes) {
      localStorage.setItem('materialTypes', JSON.stringify(response.data));
    }
    return response;
  };

  /**
   *
   * @param response
   * @returns
   */
  private handleMapRejectNames = (response: ResponseObj) => {
    const rejectNames = JSON.parse(localStorage.getItem('rejectNames'));
    if (!rejectNames) {
      localStorage.setItem('rejectNames', JSON.stringify(response.data));
    }
    return response;
  };

  /**
   *
   * @returns
   */
  public isExpired(): boolean {
    const expiredTxt = localStorage.getItem('expired');
    if (expiredTxt) {
      const expired = parseInt(expiredTxt, 10);
      const current = parseInt(moment().format('YYYYMMDDHHmm'), 10);
      return expired < current;
    }

    return true;
  }
}
