import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { initialState, metaReducers, reducers, REDUCER_TOKEN } from '../../store/store';
import { NxpLoaderBoxComponent } from './nxp-loader-box.component';

describe('NxpLoaderBoxComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NxpLoaderBoxComponent],
      imports: [
        RouterTestingModule,
        CommonModule,
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
    const fixture: ComponentFixture<NxpLoaderBoxComponent> = TestBed.createComponent(NxpLoaderBoxComponent);
    const app = fixture.debugElement.componentInstance;
    return { fixture, app };
  }

  it('should create the app', async(() => {
    const { app } = setup();
    expect(app).toBeTruthy();
  }));
});
