import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { ResponseObj } from '../../interfaces';
import { AjaxService } from '../../services';
import { IAppState } from '../../store/store';

@Component({
  selector: 'nxp-autocomplete',
  templateUrl: './nxp-autocomplete.component.html'
})
export class NxpAutocompleteComponent implements OnInit {
  // @Input() url = 'https://api.jsonbin.io/b/5dad1603becada6d1ddf2d65/latest';
  typeaheadLoading: boolean;
  typeaheadNoResults: boolean;
  typeaheadHideResultsOnBlur: boolean = false;
  dataSource: Observable<any>;
  labelColor: any = { en: 'black', th: '#73818f' };
  public titleText: string = 'Text';
  @Output() change: any = new EventEmitter<any>();
  @Input() url: string = '/ncrb/hrms/GetUsers';
  @Input() name: string = 'users';
  @Input() control: string = '';
  @Input() parentForm: FormGroup;
  @Input() placeholder: string = '';
  @Input()
  set title(title: string) {
    if (title) {
      this.titleText = title;
    } else {
      this.titleText = '';
    }
    if (this.titleText && this.titleText[this.titleText.length - 1] === '*') {
      this.labelColor = { en: 'red', th: '#ff2930' };
    } else {
      this.labelColor = { en: 'black', th: '#73818f' };
    }
  }
  @Input() type: string = 'text';
  @Input() typeInput: string = 'inline';
  @Input() items: any[] = [];
  @Input() submit: boolean = false;
  @Input() color: string = '';
  @Input() helpText: string = '';
  @Input() class: string = '';
  @Input() group: string = '';
  @Input() filter: Function = (results: any[], token: string) => {
    const result: any[] = [];
    let data: any[] = results.filter(res => {
      // searching
      const case1 = res.fname.toLowerCase().indexOf(token.toLowerCase()) > -1;
      const case2 = res.lname.toLowerCase().indexOf(token.toLowerCase()) > -1;
      const case3 =
        res.id
          .toString()
          .toLowerCase()
          .indexOf(token.toLowerCase()) > -1;
      return case1 || case2 || case3;
    });
    if (!data) {
      data = [];
    }
    for (let i = 0; i < data.length; i++) {
      result.push(`${data[i].id} - ${data[i].fname} ${data[i].lname}`);
    }
    return result;
  };
  constructor(private ajax: AjaxService, private store: Store<IAppState>, private http: HttpClient) {}

  ngOnInit(): void {
    if (parseInt(this.parentForm.get(this.control).value, 10).toString() === 'NaN') {
      this.parentForm.get(this.control).patchValue('');
    }
    if (this.titleText && this.titleText[this.titleText.length - 1] === '*') {
      this.labelColor = { en: 'red', th: '#ff2930' };
    } else {
      this.labelColor = { en: 'black', th: '#73818f' };
    }
    this.dataSource = new Observable((observer: any) => {
      // Runs on every search
      observer.next(this.parentForm.get(this.control).value);
    }).pipe(mergeMap((token: string) => this.filterResults(token)));
  }

  // fired every time search string is changed
  filterResults(token: string) {
    return this.http.post(`/ncrb/api/hrms/GetUsersByFilter/`, { value: token }).pipe(
      map((response: ResponseObj) => {
        if (!response.data) {
          response.data = [];
        }
        return this.filter ? this.filter(response.data, token) : response.data;
      })
    );
    // return this.store.select(this.name).pipe(map((users: User[]) => (this.filter ? this.filter(users, token) : users)));
  }

  // Show loading indicator
  changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  // Selected value event
  typeaheadOnSelect(e: TypeaheadMatch): void {
    this.change.emit(e.value.trim());
  }

  typeaheadOnBlur(event: any): void {
    // console.log('Blur : ', event);
  }

  onChange(event) {
    const { value } = event.target;
    this.parentForm.get(this.control).patchValue(value.trim() === '' ? null : value.trim());
    this.change.emit(value.trim() === '' ? null : value.trim());
  }

  onBlur(event) {
    //   console.log('On Blur: ', event);
    const { value } = event.target;
    if (value.trim() === '') {
      // Do nothing
    } else {
      const values = value.trim().split('-');
      if (values.length > 1) {
        // Do nothing
      } else {
        this.parentForm.get(this.control).patchValue('');
        this.change.emit('');
      }
    }
  }

  get inline() {
    return this.typeInput === 'inline';
  }

  get input() {
    return this.typeInput === 'input';
  }

  get colored() {
    return !this.parentForm.get(this.control).disabled && this.color;
  }
}
