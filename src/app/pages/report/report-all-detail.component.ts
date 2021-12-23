import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-report-all-detail',
  template: `
    <iframe
      style="width: 100%; height: calc(100vh - 55px - 45px - 50px - 55px); border: none;"
      src="https://thbnk01ncrbtw1v.wbi.nxp.com/ncrb-report/report/all-detail/?embed=true"
    ></iframe>
  `
})
export class ReportAllDetailComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
