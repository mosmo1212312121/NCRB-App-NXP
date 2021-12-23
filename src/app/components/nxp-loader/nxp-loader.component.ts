import { Component, Input } from '@angular/core';

@Component({
  selector: 'nxp-loader',
  templateUrl: './nxp-loader.component.html',
  styleUrls: ['./nxp-loader.component.scss']
})
export class NxpLoaderComponent {
  @Input() message: string = '';
  constructor() {}
}
