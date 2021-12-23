import { createReducer, on } from '@ngrx/store';
import { setuser } from '../actions';
import { User } from '../../interfaces';

export const initialUser: User = {
  empId: 'empId',
  username: 'username',
  firstname: 'firstname',
  lastname: 'lastname',
  email: 'email@domain.com',
  name: 'empId - firstname lastname',
  rolename: 'user',
  roles: []
};

export default createReducer(
  initialUser,
  on(setuser, (state, obj) => Object.assign({}, obj))
);
