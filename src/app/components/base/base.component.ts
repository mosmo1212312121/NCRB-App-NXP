import { Component } from '@angular/core';
import { LogService } from '../../services';

export class BaseComponent {
  private pageName: string = '';
  constructor(private log: LogService) {}

  protected setServices(services: any) {
    const serviceList: string[] = Object.keys(services);
    for (let i = 0; i < serviceList.length; i++) {
      if (this[serviceList[i]]) {
        this[serviceList[i]] = services[serviceList[i]];
      }
    }
  }

  protected setPageName(pageName: string) {
    this.pageName = pageName;
  }

  protected logging(logText: string, logType: string = 'DEBUG') {
    this.log.pushLog(logText, this.pageName, logType).toPromise();
  }
}
