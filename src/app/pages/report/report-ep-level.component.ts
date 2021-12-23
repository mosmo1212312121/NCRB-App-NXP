import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-report-ep-level',
  template: `
    <iframe
      style="width: 100%; height: calc(100vh - 55px - 45px - 50px - 55px); border: none;"
      src="https://thbnk01ncrbtw1v.wbi.nxp.com/ncrb-report/report/ep-level/?embed=true"
    ></iframe>
  `
})
export class ReportEPLevelComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
