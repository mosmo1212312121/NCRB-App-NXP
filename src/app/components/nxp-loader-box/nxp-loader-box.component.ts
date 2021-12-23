import { Component, Input } from '@angular/core';

@Component({
  selector: 'nxp-loader-box',
  templateUrl: './nxp-loader-box.component.html',
  styleUrls: ['./nxp-loader-box.component.scss']
})
export class NxpLoaderBoxComponent {
  @Input() message: string = '';
  constructor() {}
}
