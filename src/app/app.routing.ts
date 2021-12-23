import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Import Containers
import { DefaultLayoutComponent } from './containers';
import { P404Component } from './pages/error/404.component';
import { P500Component } from './pages/error/500.component';
import { FlowComponent } from './pages/flow/flow.component';
import { LoginComponent } from './pages/login/login.component';
import { MaintenanceComponent } from './pages/maintenance/maintenance.component';
import { RegisterComponent } from './pages/register/register.component';
import { MaintainGuardService } from './services';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard', // initial
    pathMatch: 'full'
  },
  {
    path: '404',
    component: P404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    component: P500Component,
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: {
      title: 'Register Page'
    }
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home'
    },
    children: [
      /* Pages */
      {
        path: 'maintenance',
        component: MaintenanceComponent,
        data: {
          title: 'Maintenance'
        }
      },
      {
        path: 'flow/:id',
        component: FlowComponent,
        data: {
          title: 'Flow'
        }
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'requests',
        canActivate: [MaintainGuardService],
        loadChildren: () => import('./pages/request/request.module').then(m => m.RequestModule)
      },
      {
        path: 'admin',
        loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule)
      },
      {
        path: 'debug',
        loadChildren: () => import('./pages/debug/debug.module').then(m => m.DebugModule)
      },
      {
        path: 'management',
        loadChildren: () => import('./pages/manager/manager.module').then(m => m.ManagerModule)
      },
      {
        path: 'containment',
        canActivate: [MaintainGuardService],
        loadChildren: () => import('./pages/containment/containment.module').then(m => m.ContainmentModule)
      },
      {
        path: 'corrective',
        canActivate: [MaintainGuardService],
        loadChildren: () => import('./pages/corrective/corrective.module').then(m => m.CorrectiveModule)
      },
      {
        path: 'recurrence',
        canActivate: [MaintainGuardService],
        loadChildren: () => import('./pages/recurrence/recurrence.module').then(m => m.RecurrenceModule)
      },
      {
        path: 'submit',
        loadChildren: () => import('./pages/submit/submit.module').then(m => m.SubmitModule)
      },
      {
        path: 'creating',

        canActivate: [MaintainGuardService],
        loadChildren: () => import('./pages/creating/creating.module').then(m => m.CreatingModule)
      },
      {
        path: 'finance',

        canActivate: [MaintainGuardService],
        loadChildren: () => import('./pages/finance/finance.module').then(m => m.FinanceModule)
      },
      {
        path: 'report',
        canActivate: [MaintainGuardService],
        loadChildren: () => import('./pages/report/report.module').then(m => m.ReportModule)
      }
      /* Pages */
    ]
  },
  { path: '**', component: P404Component }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
