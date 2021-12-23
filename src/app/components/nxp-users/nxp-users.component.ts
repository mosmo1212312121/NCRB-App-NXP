import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DateConstant } from '../../constants';
import { AjaxService } from '../../services';
import { user2selection } from '../../utils';
import { NxpSelection } from '../nxp-input/nxp-input.module';

@Component({
  selector: 'nxp-users',
  templateUrl: './nxp-users.component.html'
})
export class NxpUsersComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() control: string = '';
  @Input() parentForm: FormGroup;
  @Input() placeholder: string = '';
  @Input() minTermLength: number = 3;
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
  @Input()
  set color(color: string) {
    if (color) {
      this.bgColor = color;
    } else {
      this.bgColor = '';
    }
    if (this.titleText && this.titleText[this.titleText.length - 1] === '*') {
      this.labelColor = { en: 'red', th: '#ff2930' };
    } else {
      this.labelColor = { en: 'black', th: '#73818f' };
    }
  }
  @Input() helpText: string = '';
  @Input() class: string = '';
  @Input() classInput: string = '';
  @Input() minDate: Date = null;
  @Input() maxDate: Date = null;
  @Input() min: string = '0';
  @Input() rows: string = '3';
  @Input() maxlength: string = '100';
  @Input() group: string = '';
  @Output() change: any = new EventEmitter<any>();
  @Output() enter: any = new EventEmitter<any>();
  labelColor: any = { en: 'black', th: '#73818f' };
  value: any = null;
  sub: any = null;
  dateConstant: DateConstant = new DateConstant();
  public bgColor: string = '';
  public titleText: string = 'Text';
  public selected: any = null;
  public itemsSelected: NxpSelection[] = [];
  constructor(private ajax: AjaxService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    if (localStorage.getItem('users')) {
      this.items = user2selection(JSON.parse(localStorage.getItem('users')));
    } else {
      const users = (await this.ajax.getUsers().toPromise()).data;
      localStorage.setItem('users', JSON.stringify((await this.ajax.getUsers().toPromise()).data));
      this.items = user2selection(users);
    }
    if (this.parentForm.get(this.control).value) {
      const selected: string = this.parentForm.get(this.control).value;
      this.itemsSelected = this.items.filter(o => o.value.search(selected.toUpperCase()) > -1);
      this.selected = selected;
    }
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {}

  private onValuesChange(): void {
    if (this.parentForm.get(this.control) && this.parentForm.get(this.control).value === null) {
      this.parentForm.get(this.control).patchValue('');
    } else {
      this.selected = this.value;
    }
    if (this.titleText && this.titleText[this.titleText.length - 1] === '*') {
      this.labelColor = { en: 'red', th: '#ff2930' };
    } else {
      this.labelColor = { en: 'black', th: '#73818f' };
    }
    this.cdr.detectChanges();
  }

  public onChange() {
    // this.parentForm.get(this.control).patchValue(this.selected);
    this.change.emit(this.selected);
  }

  public onSearch(evt) {
    const { term } = evt;
    if (term.length > this.minTermLength - 1) {
      this.itemsSelected = this.items.filter(o => o.value.search(term.toUpperCase()) > -1);
    } else {
      this.itemsSelected = [];
    }
  }
}
