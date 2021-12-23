import { User } from '../interfaces';
import { NxpSelection } from '../components';

export const filterByName = (results: any[], token: string) => {
  // const result: any[] = [];
  // const data: any[] = results.filter(res => {
  //   const case_ = res.name.toLowerCase().indexOf(token.toLowerCase()) > -1 && res.email;
  //   return case_;
  // });
  // for (let i = 0; i < data.length; i++) {
  //   result.push(data[i]);
  // }
  return results;
};

export const user2selection = (users: User[]) => {
  const results: NxpSelection[] = [];
  for (let i = 0; i < users.length; i++) {
    const { empId, firstname, lastname } = users[i];
    results.push({
      id: i,
      label: `${empId} - ${firstname} ${lastname}`,
      value: `${empId} - ${firstname} ${lastname}`,
      text: `${empId} - ${firstname} ${lastname}`
    });
  }
  return results;
};
