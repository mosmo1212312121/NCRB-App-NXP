import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BaseComponent } from '../../../components';
import { DateConstant } from '../../../constants';
import { IHistory } from '../../../interfaces';
import { LogService } from '../../../services';
import { IAppState } from '../../../store/store';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html'
})
export class HistoryComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() ncrbno: string = '';
  dateConstant: DateConstant = new DateConstant();
  date: Date = new Date();
  historySub: any = null;

  loading: boolean = false;
  processing: boolean = false;
  isCollapsed: boolean = true;
  histories: IHistory[] = [];
  public auth: string = '';
  constructor(private store: Store<IAppState>, private logService: LogService, private router: Router) {
    // initial component
    super(logService);
    this.setPageName('history');

    this.historySub = this.store.pipe(select('histories')).subscribe((histories: IHistory[]) => {
      this.histories = histories;
    });
  }

  ngOnInit(): void {
    this.auth = localStorage.getItem('basic_auth');
  }

  ngOnDestroy(): void {
    this.historySub.unsubscribe();
  }

  onClickReport(): void {
    const url: string = `${environment.reportEndPoint}reporter/?auth=${this.auth}&ncrbno=${this.ncrbno}`;
    console.log('URL: ', url);
    window.open(url, '_blank');
  }
}
