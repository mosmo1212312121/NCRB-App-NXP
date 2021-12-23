import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppComponent } from './app.component';
import { initialState, metaReducers, reducers, REDUCER_TOKEN } from './store/store';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        RouterTestingModule,
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
    const fixture: ComponentFixture<AppComponent> = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    return { fixture, app };
  }

  it('should create the app', async(() => {
    const { app } = setup();
    expect(app).toBeTruthy();
  }));
});
