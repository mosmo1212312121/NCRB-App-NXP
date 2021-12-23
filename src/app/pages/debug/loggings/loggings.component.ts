import { Component, OnInit } from '@angular/core';
import { Pagination } from '../../../interfaces';
import { LogService } from '../../../services';

@Component({
  selector: 'app-debug-loggings',
  templateUrl: './loggings.component.html'
})
export class LoggingsComponent implements OnInit {
  public logText: string = '';
  public pagination: Pagination = {
    page: 1,
    pageLength: 10,
    total: 0,
    totalPage: 0
  };
  public sortBy: string = 'DATE-STR_DESC';
  public loading: boolean = false;
  public loggings: any[] = [];
  constructor(private logService: LogService) {}

  async ngOnInit() {
    await this.onLoad();
  }

  async onLoadByCriteria() {
    this.logText = '';
    this.loading = true;
    let results: any[] = [];
    try {
      const orderBy: string = this.sortBy
        .split('_')[0]
        .split('-')
        .join('_');
      const orderFrom: string = this.sortBy.split('_')[1];
      const response = await this.logService
        .getLogsByCriteria(this.pagination.page, this.pagination.pageLength, orderBy, orderFrom)
        .toPromise();
      if (response.data) {
        results = response.data;
        this.loggings = results;
        for (let i = 0; i < results.length; i++) {
          if (i === 0) {
            this.logText += `>> ${results[i].dateStr}: ${results[i].logTxt}\n`;
          } else {
            this.logText += `${results[i].dateStr}: ${results[i].logTxt}\n`;
          }
        }
      }
    } catch (err) {
      console.error('LogginsComponent.onLoadByCriteria : ', err);
    } finally {
      this.loading = false;
    }

    return results;
  }

  async onLoad() {
    this.logText = '';
    this.loading = true;
    let results: any[] = [];
    try {
      const response = await this.logService.getLogs().toPromise();
      if (response.data) {
        results = response.data;
        this.loggings = results;
        for (let i = 0; i < results.length; i++) {
          if (i === 0) {
            this.logText += `>> ${results[i].dateStr}: ${results[i].logTxt}\n`;
          } else {
            this.logText += `${results[i].dateStr}: ${results[i].logTxt}\n`;
          }
        }
      }
    } catch (err) {
      console.error('LogginsComponent.onLoad : ', err);
    } finally {
      this.loading = false;
    }

    return results;
  }
}
