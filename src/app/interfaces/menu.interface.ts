export interface Menu {
  id: number;
  name: string;
  url?: string;
  icon?: string;
  role: string;
  title: boolean;
  parentId?: number;
  seq: number;
  children?: Menu[];
}
