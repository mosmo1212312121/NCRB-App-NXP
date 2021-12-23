import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-report-tpt-analysis',
  template: `
    <iframe
      style="width: 100%; height: calc(100vh - 55px - 45px - 50px - 55px); border: none;"
      src="https://thbnk01ncrbtw1v.wbi.nxp.com/ncrb-report/report/tpt-analysis/?embed=true"
    ></iframe>
  `
})
export class ReportTPTAnalysisComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
