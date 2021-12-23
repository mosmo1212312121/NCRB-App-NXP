import { Injectable } from '@angular/core';
import { NxpSelection } from '../components';

@Injectable({
  providedIn: 'root'
})
export class MockService {
  private categories: NxpSelection[] = [
    { id: 1, label: 'Human', value: 1 },
    { id: 2, label: 'Machine', value: 2 },
    { id: 3, label: 'The Things', value: 3 }
  ];
  private specs: NxpSelection[] = [
    { id: 1, label: 'SpecA', value: 1 },
    { id: 2, label: 'SpecB', value: 2 },
    { id: 3, label: 'SpecC', value: 3 }
  ];
  private rejectNames: NxpSelection[] = [
    { id: 1, label: 'RejectA', value: 1 },
    { id: 2, label: 'RejectB', value: 2 },
    { id: 3, label: 'RejectC', value: 3 }
  ];
  private materialTypes: NxpSelection[] = [
    { id: 1, label: 'Compound', value: 1 },
    { id: 2, label: 'Wire', value: 2 },
    { id: 3, label: 'Etc.', value: 3 }
  ];
  private dispositionTypes: NxpSelection[] = [
    { id: 1, label: 'Scrap', value: 1 },
    { id: 2, label: 'Release', value: 2 }
  ];
  private reScreens: NxpSelection[] = [
    // { id: 1, label: 'X-Ray', value: 1 },
    // { id: 2, label: 'TI', value: 2 },
    // { id: 3, label: 'FT rescreen ambient', value: 3 },
    // { id: 4, label: 'FT rescreen hot', value: 4 },
    // { id: 5, label: 'FT rescreen', value: 5 },
    // { id: 6, label: 'Reliability', value: 6 },
    // { id: 7, label: 'WT rescreen', value: 7 }
    { id: 1, label: 'PSV / AOI', value: 1 },
    { id: 2, label: 'X-Ray', value: 2 },
    { id: 3, label: 'TI', value: 3 },
    { id: 4, label: 'FT rescreen ambient', value: 4 },
    { id: 5, label: 'FT rescreen hot', value: 5 },
    { id: 6, label: 'FT rescreen cold', value: 6 },
    { id: 7, label: 'FT special condition', value: 7 },
    { id: 8, label: 'WT rescreen', value: 8 },
    { id: 9, label: 'Other', value: 9 }
  ];
  private epLevels: NxpSelection[] = [
    { id: 1, label: '1 - ...', value: 1 },
    { id: 2, label: '2 - ...', value: 2 },
    { id: 3, label: '3 - ...', value: 3 },
    { id: 4, label: '4 - ...', value: 4 },
    { id: 5, label: '5 - ...', value: 5 }
  ];
  constructor() {}

  public getEpLevels(): NxpSelection[] {
    return this.epLevels;
  }

  public getCategories(): NxpSelection[] {
    return this.categories;
  }

  public getSpecs(): NxpSelection[] {
    return this.specs;
  }

  public getRejectNames(): NxpSelection[] {
    return this.rejectNames;
  }

  public getMaterialTypes(): NxpSelection[] {
    return this.materialTypes;
  }

  public getDispositionTypes(): NxpSelection[] {
    return this.dispositionTypes;
  }

  public getReScreens(): NxpSelection[] {
    return this.reScreens;
  }
}
