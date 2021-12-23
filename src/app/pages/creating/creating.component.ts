import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HotTableRegisterer } from '@handsontable/angular';
import * as Handsontable from 'handsontable';

@Component({
  selector: 'app-creating',
  templateUrl: 'creating.component.html',
  styles: [``]
})
export class CreatingComponent implements OnInit, AfterViewInit {
  private hotRegisterer: HotTableRegisterer = new HotTableRegisterer();
  private data: any[] = [
    ['', 'Tesla', 'Mercedes', 'Toyota', 'Volvo', ''],
    ['2019', 10, 11, '', '', ''],
    ['2020', 20, 11, 14, 13, ''],
    ['2021', 30, 15, 12, 13, '']
  ];
  public hotId: any = 'hotInstanceId';
  public settings: Handsontable.default.GridSettings = {
    data: this.data,
    rowHeaders: true,
    colHeaders: true,
    licenseKey: 'non-commercial-and-evaluation',
    allowInsertColumn: true,
    allowInsertRow: true,
    allowRemoveRow: true,
    allowRemoveColumn: true,
    headerTooltips: true,
    dropdownMenu: true,
    dragToScroll: true,
    contextMenu: true,
    filters: true,
    fillHandle: true,
    minSpareCols: this.calMinCols(),
    minSpareRows: this.calMinRows(),
    fixedRowsTop: 1,
    width: '100%',
    height: 'calc(100vh - 55px - 46px - 1.5rem - 50px - 1.5rem)',
    undo: true
  };
  public hotRef: Handsontable.default = this.hotRegisterer.getInstance(this.hotId);
  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  private calMinCols(): number {
    const firstRow: any[] = this.data.length > 0 ? this.data[0] : [];
    return firstRow.length > 33 ? 0 : 33 - firstRow.length;
  }

  private calMinRows(): number {
    return this.data.length > 40 ? 0 : 40 - this.data.length;
  }
}
