import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAppState } from '../store/store';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class RoleActionService extends BaseService {
  constructor(private store: Store<IAppState>, private http: HttpClient) {
    super();
    this.setHttpCli(this.http);
  }

  /**
   *
   * @param mfg
   * @param subMfg
   * @returns
   */
  public getGroupNames(mfg: string, subMfg: string) {
    return this.post(`/api/roleaction/GetGroupName`, {
      mfg: parseInt(mfg, 10),
      subMfg: parseInt(subMfg, 10)
    });
  }

  /**
   *
   * @param page
   * @param pageLength
   * @param orderBy
   * @param orderFrom
   * @param startDate
   * @param endDate
   * @param searching
   * @returns
   */
  public getRoleActions(
    page: number,
    pageLength: number,
    orderBy: string,
    orderFrom: string,
    startDate: string = null,
    endDate: string = null,
    searching: string = ''
  ) {
    return this.post(`/api/roleaction/Get`, {
      page,
      pageLength,
      orderBy,
      orderFrom,
      startDate,
      endDate,
      roleAction: searching
    });
  }

  /**
   *
   * @param rid
   * @returns
   */
  public deleteRoleAction(rid: string) {
    return this.delete(`/api/roleaction/Delete/${rid}`);
  }

  /**
   *
   * @param roleAction
   * @returns
   */
  public saveRoleaction(roleAction: any) {
    return this.post(`/api/roleaction/Create`, roleAction);
  }

  /**
   *
   * @param raid
   * @param roleAction
   * @returns
   */
  public updateRoleAction(raid: string, roleAction: any) {
    return this.put(`/api/roleaction/Update/${raid}`, roleAction);
  }
}
