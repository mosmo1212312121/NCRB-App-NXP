import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { User } from '../interfaces';
import { IAppState } from '../store/store';
import { BaseService } from './base.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class LogService extends BaseService {
  constructor(private store: Store<IAppState>, private http: HttpClient) {
    super();
    this.setHttpCli(this.http);
  }

  public getLogsByCriteria(page: number, pageLength: number, orderBy: string, orderFrom: string) {
    return this.post('/api/loggings/view', {
      page,
      pageLength,
      orderBy,
      orderFrom
    });
  }

  public getLogs() {
    return this.get('/api/loggings/');
  }

  public pushLog(logTxt: string, pageName: string = '/', logType: string = 'DEBUG') {
    const userStr = localStorage.getItem('user');
    const log = {
      logTxt: logTxt,
      dateStr: moment().format('YYYY-MM-DD HH:mm:ss.SS'),
      empId: 'anonymous',
      username: 'anonymous',
      pageName: pageName,
      logType: logType
    };
    if (userStr) {
      const user: User = JSON.parse(userStr);
      return this.post('/api/loggings/', { ...log, ...{ empId: user.empId, username: user.username } });
    } else {
      return this.post('/api/loggings/', log);
    }
  }
}
