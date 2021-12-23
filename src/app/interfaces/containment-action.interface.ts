import { FileObj } from './file.interface';

export interface ContainmentAction {
  id: number;
  addonsNote?: string;
  confirmBy?: string;
  confirmById?: string;
  correction?: string;
  correctionAttach?: FileObj;
  date?: any;
  lotId?: string;
  machineNo?: string;
  remark?: string;
  responsePerson?: string;
  responsePersonId?: string;
  rootCause?: string;
  rootCauseAttach?: FileObj;
  reason?: string;
}

export interface ContainmentActionCa {
  actionDetail: string;
  actionDetailOwner?: string;
  actionDriver: string;
  actionId: number;
  actionNo: string;
  actionOwner: string;
  actionType: string;
  champNo: string;
  ncrbid: number;
  reference8D: string;
  status: string;
  targetDate: Date;
  createBy: string;
  owner?: string;
}

export interface CorrectiveActionPCa extends ContainmentActionCa {
  ep: number;
  effectiveness: number;
}

export interface PreventRecurrencePr extends ContainmentActionCa {
  ep: number;
  effectiveness: number;
}
