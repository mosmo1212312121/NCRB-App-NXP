import { createAction, props } from '@ngrx/store';
import { Menu } from '../../interfaces';

export const setmenus = createAction('[Menu] Set', props<{ menus: Menu[] }>());
