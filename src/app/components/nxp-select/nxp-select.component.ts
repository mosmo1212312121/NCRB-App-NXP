import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { DateConstant } from '../../constants';
import { Initial } from '../../interfaces';
import { AjaxService } from '../../services';
import { IAppState } from '../../store/store';

@Component({
  selector: 'nxp-select',
  templateUrl: './nxp-select.component.html',
  styles: [
    `
      .list-searching {
        position: absolute;
        z-index: 9999;
        width: 91%;
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid rgba(0, 0, 0, 0.125);
        background: white;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
      }
      .lists-group {
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
      }
      .list-group-item {
        padding: 0.5rem 1.25rem;
      }
      .list-group-item:hover {
        cursor: pointer;
        background: rgba(0, 0, 0, 0.1);
      }
    `
  ]
})
export class NxpSelectComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('searchTxt') _searchTxt: ElementRef<HTMLInputElement>;
  @ViewChild('clearBtn') _clearBtn: ElementRef<HTMLButtonElement>;
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
  @Output() change: any = new EventEmitter<any>();
  @Output() enter: any = new EventEmitter<any>();
  labelColor: any = { en: 'black', th: '#73818f' };
  value: any = null;
  sub: any = null;
  requestSub: any = null;
  dateConstant: DateConstant = new DateConstant();
  public bgColor: string = '';
  public titleText: string = 'Text';
  public selected: any = null;
  public focus: boolean = false;
  public searchTxt: string = '';
  constructor(
    private fb: FormBuilder,
    private store: Store<IAppState>,
    private ajax: AjaxService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.requestSub = this.store.pipe(select('request')).subscribe((request: Initial) => {
      if (this.control && request[this.control]) {
        this.selected = request[this.control];
      }
    });
    // this.onValuesChange();
    this.sub = this.parentForm.valueChanges.subscribe(values => {
      if (values[this.control]) {
        const idx: number = this.items.findIndex(o => parseInt(o.value, 10) === parseInt(values[this.control], 10));
        if (idx > -1) {
          this.selected = this.items[idx].value;
          this.searchTxt = this.items[idx].label;
          if (this._searchTxt) {
            this._searchTxt.nativeElement.value = this.items[idx].label;
          }
        }
      }

      if (this.value !== values[this.control]) {
        this.value = values[this.control];
        if (this.items) {
          const idx: number = this.items.findIndex(o => parseInt(o.value, 10) === parseInt(this.value, 10));
          if (idx > -1) {
            this.onSelect(idx);
          } else {
            if (this._clearBtn) {
              this._clearBtn.nativeElement.click();
            } else {
              this.onClear(false);
            }
          }
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.requestSub.unsubscribe();
    this.sub.unsubscribe();
  }

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
    this.parentForm.get(this.control).patchValue(this.selected);
    this.change.emit(this.selected);
  }

  public onKeyup(evt) {
    this.searchTxt = evt.target.value;
  }

  public onFocus() {
    setTimeout(() => {
      this.focus = true;
    }, 50);
  }

  public onBlur() {
    setTimeout(() => {
      this.focus = false;
    }, 150);
  }

  public isMatch(idx: number): boolean {
    const item = this.items[idx];
    if (item && this.searchTxt) {
      return item.label.toUpperCase().search(this.searchTxt.toUpperCase()) > -1;
    } else {
      return true;
    }
  }

  public onSelect(idx: number): void {
    this.selected = this.items[idx].value;
    this.searchTxt = this.items[idx].label;
    if (this._searchTxt) {
      this._searchTxt.nativeElement.value = this.items[idx].label;
    }
    this.onChange();
  }

  public onClear(change: boolean = true): void {
    this.selected = '';
    this.searchTxt = '';
    if (this._searchTxt) {
      this._searchTxt.nativeElement.value = '';
    }
    if (change) {
      this.onChange();
    }
  }
}
