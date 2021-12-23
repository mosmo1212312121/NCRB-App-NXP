import { createReducer, on } from '@ngrx/store';
import { Reporter } from '../../interfaces';
import { setreportfilter, setreportresult } from '../actions';

const date = new Date();

export const initialReport: Reporter = {
  filterLotDetail: {
    assyCg: '',
    bl: '',
    createdFrom: date,
    createdTo: date,
    department: '',
    disposition: '',
    faCode: '',
    failureName: '',
    lot: '',
    machine: '',
    minicompany: '',
    ncrbNo: '',
    product: '',
    statusGroup: ''
  },
  filterScrap: {
    createdFrom: date,
    createdTo: date,
    disposition: ''
  },
  filterTop10: {
    bl: '',
    causeFromProcess: '',
    createdFrom: date,
    createdTo: date,
    department: '',
    faCode: '',
    failureName: '',
    machine: '',
    magCode: '',
    minicompany: '',
    problemArea: '',
    problemFrom: '',
    problemType: '',
    productionDescription: '',
    statusGroup: ''
  },
  resultLotDetail: [],
  resultMaterial: [],
  resultPending: [],
  resultTop10Group: {
    groupByAssyCg: [],
    groupByFailure: [],
    groupByProblemType: [],
    groupByProduct: []
  }
};

export default createReducer(
  initialReport,
  on(setreportfilter, (state, obj) => state),
  on(setreportresult, (state, obj) => state)
);
