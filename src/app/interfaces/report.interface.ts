export interface Reporter {
  // filter for searching
  filterTop10: ReportTop10Filter;
  filterLotDetail: ReportLotDetailFilter;
  filterScrap: ReportScrapFilter;
  // result after searched
  resultLotDetail: ReportResultLotDetail[];
  resultTop10Group: ReportResultTop10Group;
  resultPending: ReportResultPending[];
  resultMaterial: ReportResultMaterial[];
}

export interface ReportScrapFilter {
  disposition: string;
  createdFrom: Date;
  createdTo: Date;
}

export interface ReportFilter {
  bl: string;
  createdFrom: Date;
  createdTo: Date;
  department: string;
  faCode: string;
  failureName: string;
  machine: string;
  minicompany: string;
  statusGroup: string;
}

export interface ReportLotDetailFilter extends ReportFilter {
  disposition: string;
  ncrbNo: string;
  lot: string;
  product: string;
  assyCg: string;
}

export interface ReportTop10Filter extends ReportFilter {
  causeFromProcess: string;
  magCode: string;
  problemArea: string;
  problemFrom: string;
  problemType: string;
  productionDescription: string;
}

export interface ReportMaterialFilter {
  invoiceNo: string;
  stockNo: string;
  department: string;
  miniCompany: string;
  createdFrom: Date;
  createdTo: Date;
  failureName: string;
  faCode: string;
}

export interface ReportResultLotDetail {
  _12nc: string;
  complete: Date;
  cost: string;
  created: Date;
  disposition: string;
  dispositionDate: Date;
  lot: string;
  ncrbNo: string;
  status: string;
  tpt: string;
  tptDispose: string;
  valid: Date;
}

export interface ReportResultTop10Group {
  groupByAssyCg: ReportResultTop10GroupDetail[];
  groupByFailure: ReportResultTop10GroupDetail[];
  groupByProblemType: ReportResultTop10GroupDetail[];
  groupByProduct: ReportResultTop10GroupDetail[];
}

export interface ReportResultTop10GroupDetail {
  countOfLotId: string;
  name: string;
}

export interface ReportResultPending {
  complete: Date;
  created: Date;
  disposition: string;
  dispositionDate: Date;
  faCodeGroup: string;
  miniCompany: string;
  ncrbNo: string;
  owner: string;
  status: string;
  tpt: string;
  tptDispose: string;
  valid: Date;
}

export interface ReportResultMaterial {
  created: Date;
  failure: string;
  invoiceNo: string;
  miniCompany: string;
  ncrbNo: string;
  status: string;
  stockNo: string;
  supplier: string;
  type: string;
}
