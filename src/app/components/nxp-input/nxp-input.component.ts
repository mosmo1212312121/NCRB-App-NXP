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
import { FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { DateConstant } from '../../constants';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'nxp-input',
  templateUrl: './nxp-input.component.html'
})
export class NxpInputComponent implements OnInit, AfterViewInit, OnDestroy {
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
    this.onValuesChange();
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
    this.onValuesChange();
  }
  @Input() group: string = '';
  @Input() helpText: string = '';
  @Input() class: string = '';
  @Input() classInput: string = '';
  @Input() minDate: Date = null;
  @Input() maxDate: Date = null;
  @Input() min: string = '0';
  @Input() rows: string = '3';
  @Input() maxlength: string = '100';
  @Input() style: NgStyle = null;
  @Input() nonIdentify: boolean = false;
  @Output() change: any = new EventEmitter<any>();
  @Output() enter: any = new EventEmitter<any>();
  @Output() focus: any = new EventEmitter<any>();
  @Output() blur: any = new EventEmitter<any>();
  labelColor: any = { en: 'black', th: '#73818f' };
  value: any = null;
  sub: any = null;
  dateConstant: DateConstant = new DateConstant();
  public bgColor: string = '';
  public titleText: string = 'Text';
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.parentForm.get(this.control) && this.min && this.type === 'number') {
      if (this.parentForm.get(this.control).validator) {
        this.parentForm
          .get(this.control)
          .setValidators([Validators.min(parseInt(this.min, 10)), this.parentForm.get(this.control).validator]);
      } else {
        this.parentForm.get(this.control).setValidators([Validators.min(parseInt(this.min, 10))]);
      }
      this.parentForm.get(this.control).updateValueAndValidity();
    }
    this.onValuesChange();
    this.sub = this.parentForm.valueChanges.subscribe(values => {
      if (this.value !== values[this.control]) {
        this.value = values[this.control];
        this.onValuesChange();
      }
    });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onPress(event: any) {
    let charCode: any;
    const WINDOW: any = window;
    if (event && event.which) {
      charCode = event.which;
    } else if (WINDOW.event) {
      event = WINDOW.event;
      charCode = event.keyCode;
    }
    if (charCode === 13) {
      // Do your thing here with element
      this.enter.emit(true);
    }
  }

  onChange(event) {
    const { value } = event.target;
    this.parentForm.get(this.control).patchValue(value);
    this.change.emit(value);
  }

  onBlur(evt) {
    this.blur.emit(evt);
  }

  onFocus(evt) {
    this.focus.emit(evt);
  }

  private onValuesChange(): void {
    if (!this.parentForm.get(this.control)) {
      console.log('IS NULL : ', this.control);
    }
    if (this.type === 'date') {
      if (this.parentForm.get(this.control).disabled) {
        if (typeof this.parentForm.get(this.control).value === 'object') {
          const date: Date = this.parentForm.get(this.control).value;
          const dateStr = moment(date).format(this.dateConstant.format.toUpperCase());
          this.parentForm.get(this.control).patchValue(dateStr);
        }
      }
    }
    if (this.parentForm.get(this.control) && this.parentForm.get(this.control).value === null) {
      this.parentForm.get(this.control).patchValue('');
    }
    if (this.titleText && this.titleText[this.titleText.length - 1] === '*') {
      this.labelColor = { en: 'red', th: '#ff2930' };
    } else {
      this.labelColor = { en: 'black', th: '#73818f' };
    }
    this.cdr.detectChanges();
  }

  get inline() {
    return this.typeInput === 'inline' && this.type !== 'date';
  }

  get inlineDate() {
    return this.typeInput === 'inline' && this.type === 'date';
  }

  get input() {
    return this.typeInput === 'input';
  }

  get selection() {
    return this.typeInput === 'selection';
  }

  get colored() {
    return this.parentForm.get(this.control) && !this.parentForm.get(this.control).disabled && this.color;
  }

  get isDisabled() {
    return this.parentForm.get(this.control) && this.parentForm.get(this.control).disabled;
  }

  get inlinetext() {
    return this.typeInput === 'inlinetext';
  }

  get textarea() {
    return this.typeInput === 'textarea';
  }
}
