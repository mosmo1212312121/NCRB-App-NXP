import { createReducer, on } from '@ngrx/store';
import { Menu } from '../../interfaces';
import { setmenus } from '../actions';

export const initialMenu: Menu[] = [];

export default createReducer(
  initialMenu,
  on(setmenus, (state, obj) => obj.menus.slice())
);
