import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ResponseObj } from '../interfaces';
import { alertError, alertWarning, mapping } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  public headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });
  public apiUrl: string = environment.apiUrl ? environment.apiUrl : '/ncrb';
  private httpCli: HttpClient = null;
  constructor() {}

  protected setHttpCli(http: HttpClient) {
    this.httpCli = http;
  }

  protected get(url: string, opts: any = { responseType: 'json' }) {
    return this.httpCli
      .get(`${this.apiUrl}${url}`, opts)
      .pipe(map(mapping), map(this.handleMap), catchError(this.handleError));
  }

  protected file(url: string, opts: any = { responseType: 'blob' }) {
    return this.httpCli.get(`${this.apiUrl}${url}`, opts);
  }

  protected post(url: string, data: any, opts: any = { responseType: 'json' }) {
    return this.httpCli
      .post(`${this.apiUrl}${url}`, data, opts)
      .pipe(map(mapping), map(this.handleMap), catchError(this.handleError));
  }

  protected put(url: string, data: any, opts: any = { responseType: 'json' }) {
    return this.httpCli
      .put(`${this.apiUrl}${url}`, data, opts)
      .pipe(map(mapping), map(this.handleMap), catchError(this.handleError));
  }

  protected delete(url: string, opts: any = { responseType: 'json' }) {
    return this.httpCli
      .delete(`${this.apiUrl}${url}`, opts)
      .pipe(map(mapping), map(this.handleMap), catchError(this.handleError));
  }

  protected handleMap = (response: ResponseObj) => {
    if (response.status === 204) {
      alertWarning(`<p>Please try again..</p>
          <span style="color: red; white-space: pre-line;">${response.statusText}</span>`);
      return response;
    }
    if (response.status !== 200) {
      throw new Error(response.statusText);
    }
    return response;
  };

  protected handleError = err => {
    let output: string = err;
    if (typeof err === 'object') {
      if (err.statusText) {
        output = err.statusText;
      }
    }
    alertError(`<p>Something went wrong please contact administrator..</p>
        <span style="color: red; white-space: pre-line;">${output}</span>`);
    return throwError('Error');
  };

  protected downloadFile(blob, fileName: string = 'file') {
    // const url = window.URL.createObjectURL(blob);
    // window.open(url);
    const isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
    if (isIEOrEdge) {
      if (window.navigator.msSaveOrOpenBlob) {
        //IE & Edge
        //msSaveBlob only available for IE & Edge
        window.navigator.msSaveBlob(blob, fileName);
      }
    } else {
      const url: string = window.URL.createObjectURL(blob);
      const Document: any = document;
      const a = Document.createElement('a');
      Document.body.appendChild(a);
      a.style = 'display: none';
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }
}
