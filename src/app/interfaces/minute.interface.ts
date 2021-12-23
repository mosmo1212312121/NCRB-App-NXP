import { FileObj } from './file.interface';

export interface Minute {
  id: number;
  ncrbNo: string;
  meetingDate: any;
  minuteNote: string;
  minuteFile: FileObj;
  userName?: string;
  name?: string;
}
