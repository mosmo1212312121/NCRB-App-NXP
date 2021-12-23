import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { initialState, metaReducers, reducers, REDUCER_TOKEN } from '../../store/store';
import { NxpInputComponent } from './nxp-input.component';

describe('NxpInputComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NxpInputComponent],
      imports: [
        RouterTestingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        BsDropdownModule,
        ButtonsModule.forRoot(),
        BsDatepickerModule.forRoot(),
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

  function setup() {
    const fixture: ComponentFixture<NxpInputComponent> = TestBed.createComponent(NxpInputComponent);
    const app = fixture.debugElement.componentInstance;
    return { fixture, app };
  }

  it('should create the app', async(() => {
    const { app } = setup();
    expect(app).toBeTruthy();
  }));
});
