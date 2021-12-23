import { createReducer, on } from '@ngrx/store';
import { setrequest } from '../actions';
import { Initial } from '../../interfaces';

export const initialRequest: Initial = {
  id: null,
  ncnumber: null,
  date: null,
  ackDate: null,
  problemType: null,
  issueByName: '',
  mfg: null,
  issueByGroup: null,
  subMfg: null,
  shift: null,
  problemProcess: null,
  special: null,
  stopAndFix: null,
  rejectName: null,
  spec: '',
  category: null,
  owner: '',
  rejectDetail: '',
  operatorId: '',
  ownerMaterial: '',
  ownerProduction: '',
  materialType: 0,
  attachFile: '',
  lots: [],
  materials: [],
  operation: '',
  isAcknowledge: false,
  isFinal: false,
  isInProcess: false,
  isMaterial: false,
  isOwner: false,
  isPreviousProcess: false,
  isRequest: false,
  isSubmit: false,
  isWafer: false,
  members: [],
  owners: [],
  ownersD4d8: [],
  fuqa: [],
  pemqa: [],
  mteEngineers: [],
  mteManagers: [],
  teamMembers: [],
  directors: [],
  finances: [],
  materialOwners: [],
  fabMembers: []
};

export default createReducer(
  initialRequest,
  on(setrequest, (state, obj) =>
    Object.assign({}, obj, {
      subMfg: obj.subMfg ? parseInt(obj.subMfg.toString(), 10) : null,
      problemProcess: obj.problemProcess ? parseInt(obj.problemProcess.toString(), 10) : null
    })
  )
);
