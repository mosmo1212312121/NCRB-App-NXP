export interface User {
  [x: string]: any;
  id?: number;
  empId: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  rolename?: string;
  name?: string;
  shortname?: string;
  tel?: string;
  department?: string;
  roles?: string[];
}
