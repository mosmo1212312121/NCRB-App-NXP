import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-report-top-5-failure',
  template: `
    <iframe
      style="width: 100%; height: calc(100vh - 55px - 45px - 50px - 55px); border: none;"
      src="https://thbnk01ncrbtw1v.wbi.nxp.com/ncrb-report/report/top-5-failure/?embed=true"
    ></iframe>
  `
})
export class ReportTop5Component implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
