import { ResponseObj } from '../interfaces';
import { NgxXml2jsonService } from 'ngx-xml2json';

export const mapping = response => {
  return response as ResponseObj;
};

export const xmlToJson = xmlString => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, 'text/xml');
  let obj = new NgxXml2jsonService().xmlToJson(xml);

  /* process */
  obj = obj[Object.keys(obj)[0]];
  if (obj['#text']) {
    delete obj['#text'];
  }
  if (obj['@attributes']) {
    delete obj['@attributes'];
  }
  /* process */

  return obj;
};

export const removeProperty = obj => {
  if (obj['#text']) {
    delete obj['#text'];
  }
  if (typeof obj === 'object') {
    obj = obj[Object.keys(obj)[0]];
  }
  return obj;
};
