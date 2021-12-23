import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { initialState, metaReducers, reducers, REDUCER_TOKEN } from '../../store/store';
import { NxpAutocompleteComponent } from './nxp-autocomplete.component';

describe('NxpAutocompleComponent', () => {
  let component: NxpAutocompleteComponent;
  let fixture: ComponentFixture<NxpAutocompleteComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NxpAutocompleteComponent],
      imports: [
        RouterTestingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        BsDropdownModule,
        ButtonsModule.forRoot(),
        TypeaheadModule.forRoot(),
        HttpClientModule,
        StoreModule.forRoot(REDUCER_TOKEN, {
          metaReducers,
          initialState: initialState
        }),
        // Instrumentation must be imported after importing StoreModule (config is optional)
        StoreDevtoolsModule.instrument({
          maxAge: 25, // Retains last 25 states
          logOnly: false // Restrict extension to log-only mode
        })
      ],
      providers: [
        {
          provide: REDUCER_TOKEN,
          useValue: reducers
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NxpAutocompleteComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should create with array object', async () => {
  //   component.title = 'Hahaha';
  //   component.items = [];
  //   expect(component).toBeTruthy();
  // });

  // function setup() {
  //   const fixture: ComponentFixture<NxpAutocompleteComponent> = TestBed.createComponent(NxpAutocompleteComponent);
  //   const app = fixture.debugElement.componentInstance;
  //   return { fixture, app };
  // }

  // it('should create the app', async(() => {
  //   const { app } = setup();
  //   expect(app).toBeTruthy();
  // }));
});
