import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ServiceWorkerModule } from '@angular/service-worker';
import {
  AppAsideModule,
  AppBreadcrumbModule,
  AppFooterModule,
  AppHeaderModule,
  AppSidebarModule
} from '@coreui/angular';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ChartsModule } from 'ng2-charts';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NxpLoaderModule } from 'nxp-loader';
import { environment } from '../../../environments/environment';
import { NxpAutocompleteModule, NxpInputModule, NxpScoreModule } from '../../components';
import { initialState, metaReducers, reducers, REDUCER_TOKEN } from '../../store/store';
import { DefaultLayoutComponent } from './default-layout.component';

describe('DefaultLayoutComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DefaultLayoutComponent],
      imports: [
        AppAsideModule,
        RouterTestingModule,
        AppBreadcrumbModule.forRoot(),
        AppFooterModule,
        AppHeaderModule,
        AppSidebarModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        FormsModule,
        HttpClientModule,
        ModalModule.forRoot(),
        NxpAutocompleteModule,
        NxpInputModule,
        NxpLoaderModule,
        NxpScoreModule,
        PerfectScrollbarModule,
        ReactiveFormsModule,
        TabsModule.forRoot(),
        TypeaheadModule.forRoot(),
        StoreModule.forRoot(REDUCER_TOKEN, {
          metaReducers,
          initialState: initialState
        }),
        // Instrumentation must be imported after importing StoreModule (config is optional)
        StoreDevtoolsModule.instrument({
          maxAge: 25, // Retains last 25 states
          logOnly: false // Restrict extension to log-only mode
        }),
        ChartsModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
          enabled: environment.production,
          registrationStrategy: 'registerImmediately'
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
    const fixture: ComponentFixture<DefaultLayoutComponent> = TestBed.createComponent(DefaultLayoutComponent);
    const app = fixture.debugElement.componentInstance;
    return { fixture, app };
  }

  it('should create the app', async(() => {
    const { app } = setup();
    expect(app).toBeTruthy();
  }));

  it('should create navbar-brand', () => {
    const { fixture } = setup();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.getElementsByClassName('navbar-brand').length).toEqual(1);
  });
});
