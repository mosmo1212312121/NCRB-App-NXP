import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAppState } from '../store/store';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class RejectNameService extends BaseService {
  constructor(private store: Store<IAppState>, private http: HttpClient) {
    super();
    this.setHttpCli(this.http);
  }

  public getRejectNames(
    page: number,
    pageLength: number,
    orderBy: string,
    orderFrom: string,
    startDate: string = null,
    endDate: string = null,
    searching: string = ''
  ) {
    return this.post(`/api/reject/Get`, {
      page,
      pageLength,
      orderBy,
      orderFrom,
      startDate,
      endDate,
      rejectName: searching
    });
  }

  public deleteRejectName(rid: string) {
    return this.delete(`/api/reject/Delete/${rid}`);
  }

  public saveRejectName(rejectName: any) {
    return this.post(`/api/reject/Create`, rejectName);
  }

  public updateRejectName(rid: string, rejectName: any) {
    return this.put(`/api/reject/Update/${rid}`, rejectName);
  }
}
