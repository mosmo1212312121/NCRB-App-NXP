import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

const URL = environment.assetsUrl;

@Component({
  selector: 'app-maintenance',
  templateUrl: 'maintenance.component.html'
})
export class MaintenanceComponent {
  loading: boolean = false;
  image: string = `${URL}/assets/img/web-maintenance.png`;
}
