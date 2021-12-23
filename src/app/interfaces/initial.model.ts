import { FileObj } from './file.interface';

export class Initial {
  [x: string]: any;
  ackDate?: any;
  attachFile: string;
  category: number;
  date: any;
  faCode?: number;
  id?: number;
  issueByGroup: number;
  issueByName: string;
  lotMaster?: string;
  lots: Lot[];
  materials: LotMaterial[];
  mergeBy?: string;
  mergeWithId?: number;
  mergeWithNumber?: string;
  mfg: number;
  ncnumber: string;
  operation?: string;
  operatorId: string;
  owner?: string;
  ownerMaterial?: string;
  ownerProduction?: string;
  problemProcess: number;
  problemType: number;
  rejectDetail: string;
  rejectName: number;
  shift: number;
  spec: string;
  special: number;
  stopAndFix: number;
  subMfg: number;
  typeName?: string;
  workflow?: string;

  d1Valid?: boolean;
  d2Valid?: boolean;
  d2LotValid?: boolean;
  d2LotMaterialValid?: boolean;

  // status
  isAcknowledge?: boolean;
  isApproveAll?: boolean;
  isD12D3?: boolean;
  isD12D8?: boolean;
  isD12D83x5Why?: boolean;
  isDispositionAll?: boolean;
  isFinal?: boolean;
  isInProcess?: boolean;
  isMaterial?: boolean;
  isOwner?: boolean;
  isPEMQA?: boolean;
  isPreviousProcess?: boolean;
  isRequest?: boolean;
  isSelectProblemTypeAndMfg?: boolean;
  isSubmit?: boolean;
  isSw1?: boolean;
  isSw2?: boolean;
  isWafer?: boolean;
  isMerged?: boolean;
  isInstruction?: boolean;
  notFinalAndWafer?: boolean;
  retest?: boolean;
  disposition?: boolean;
  members?: any[];
  owners?: Owner[];
  fuqa?: Owner[];
}

export interface Owner {
  id: number;
  empId: string;
  username: string;
  rolename: string;
  name: string;
  ncrbno: string;
  ncrbid: number;
  by?: string;
}

export class Lot {
  id?: number;
  seq: number;
  product12nc: string;
  assyCg: string;
  blName: string;
  currentOpt: string;
  dateCode: string;
  lotId: string;
  machine: string;
  productDesc: string;
  quantity: number;
  rejectQty: number;
  problemType: number;
  waferBatch: string;
  simpleSize: number;
  safeLaunch: number;
  osReject?: number;
  paraQty?: number;
  step?: string;
  workflow?: string;
  disposition?: string;
  dispositionType?: number;
  rescreen1?: number;
  rescreen2?: number;
  rescreen3?: number;
  result1?: string;
  result2?: string;
  result3?: string;
  resultBy1?: string;
  resultBy2?: string;
  resultBy3?: string;
  fuByQa1?: string;
  fuByQa2?: string;
  fuByQa3?: string;
  approveBy?: string;
  attach?: FileObj;
  groupName?: number;
  workOrder?: string;
  trackIn?: string;
  trackOut?: string;
  [x: string]: any;
}

export class LotMaterial {
  id?: number;
  seq: number;
  product12nc: string;
  assyCg: string;
  blName: string;
  currentOpt: string;
  dateCode: string;
  lotId: string;
  machine: string;
  handler?: string;
  productDesc: string;
  quantity: number;
  rejectQty: number;
  problemType: number;
  waferBatch: string;
  simpleSize: number;
  safeLaunch: number;
  osReject?: number;
  paraQty?: number;
  step?: string;
  workflow?: string;
  disposition?: string;
  dispositionType?: number;
  rescreen1?: number;
  rescreen2?: number;
  rescreen3?: number;
  result1?: string;
  result2?: string;
  result3?: string;
  fuByQa1?: string;
  fuByQa2?: string;
  fuByQa3?: string;
  approveBy?: string;
  [x: string]: any;
}