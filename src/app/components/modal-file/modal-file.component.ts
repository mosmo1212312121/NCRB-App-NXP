import { AfterViewInit, Component, EventEmitter, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DateConstant } from '../../constants';
import { AjaxService } from '../../services';

@Component({
  selector: 'app-modal-file',
  templateUrl: 'modal-file.component.html',
  styles: [
    `
      .card:hover {
        cursor: pointer;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
      }
      iframe {
        min-height: calc(100vh - 55px - 50px - 59px - 59px);
        background: #2f353a;
      }
    `
  ]
})
export class ModalFileComponent implements OnInit, AfterViewInit {
  title: string = 'File';
  folders: string[] = [];
  fileid: number = 0;
  filename: string = '';
  filenames: string = '';
  public url: any;
  public dateConstant: DateConstant = new DateConstant();
  public event: EventEmitter<any> = new EventEmitter();
  public loading: boolean = true;
  bsModRef: BsModalRef;
  constructor(public bsModalRef: BsModalRef, private ajax: AjaxService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    const url: string = this.ajax.apiUrl + '/file/GetFile/' + this.folders.join(',') + ',' + this.filenames;
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    console.log('This URI: ', this.url);
  }

  ngAfterViewInit() {}

  async onDownload() {
    await this.ajax.getFile(this.fileid, this.filename).toPromise();
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }

  get cannotdownload(): boolean {
    return this.filenames.search('Not Found') > -1;
  }
}
