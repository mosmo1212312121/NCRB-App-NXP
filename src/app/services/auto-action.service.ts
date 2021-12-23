import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAppState } from '../store/store';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class AutoActionService extends BaseService {
  constructor(private store: Store<IAppState>, private http: HttpClient) {
    super();
    this.setHttpCli(this.http);
  }

  public getAuto(mfg: string, subMfg: string, rejectName: string) {
    return this.post(`/api/auto/Find`, {
      mfg,
      subMfg,
      rejectName
    });
  }

  public getAutoAct(autoDispositionId: string) {
    return this.get(`/api/auto/FindAct/${autoDispositionId}`);
  }

  public saveAct(autoAct: any) {
    return this.post(`/api/auto/SaveAction`, autoAct);
  }

  public getAutoDispositions(
    page: number,
    pageLength: number,
    orderBy: string,
    orderFrom: string,
    startDate: string = null,
    endDate: string = null
  ) {
    return this.post(`/api/auto/Get`, {
      page,
      pageLength,
      orderBy,
      orderFrom,
      startDate,
      endDate
    });
  }

  public getAutoDispositionByNC(ncrbno: string) {
    return this.get(`/api/auto/FindByNC/${ncrbno}`);
  }

  public deleteRejectName(rid: string) {
    return this.delete(`/api/auto/Delete/${rid}`);
  }

  public deleteAutoAction(id: string) {
    return this.delete(`/api/auto/DeleteAct/${id}`);
  }

  public saveAutoDisposition(autoDispose: any) {
    return this.post(`/api/auto/SaveDisposition`, autoDispose);
  }

  public saveRejectName(rejectName: any) {
    return this.post(`/api/auto/Create`, rejectName);
  }

  public updateRejectName(rid: string, rejectName: any) {
    return this.put(`/api/auto/Update/${rid}`, rejectName);
  }
}
