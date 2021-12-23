export interface Member {
  [x: string]: any;
  id: number;
  empId: string;
  name: string;
  department: string;
  tel: string;
  email: string;
  username?: string;
  fullname?: string;
  shortname?: string;
  createBy: string;
}
