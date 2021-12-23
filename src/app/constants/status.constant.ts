export class Status {
  public REQUEST: string = 'Req';
  public ACKNOWLEDGE: string = 'Ack';
  public ACKNOWLEDGE2: string = 'Ack2';
  public ACKNOWLEDGE3: string = 'Ack3';
  public CHANGE: string = 'Change';
  public CHANGEOWNER: string = 'ChangeOwner';
  public SUBMIT: string = 'Submit';
  public SW1: string = 'SW1';
  public SW2: string = 'SW2';
  public SW2SUBMIT: string = 'Submit2Board';
  public END: string = 'End';
  public APPROVE: string = 'Appr';
  public REJECT: string = 'Rejt';
  public VOID: string = 'Void';
  public UNVOID: string = 'Unvoid';
  public DRAFT: string = 'DRAFT';
  public MERGE: string = 'Merge';

  public getStatusTxt(status: string) {
    switch (status) {
      case this.SUBMIT:
        return 'Submitted';
      case this.REQUEST:
        return 'Requesting';
      case this.ACKNOWLEDGE:
        return 'Acknowledged';
      case this.ACKNOWLEDGE2:
        return 'Acknowledged';
      case this.ACKNOWLEDGE3:
        return 'Acknowledged';
      case this.CHANGE:
        return 'Change';
      case this.CHANGEOWNER:
        return 'Change Owner';
      case this.APPROVE:
        return 'Approved';
      case this.REJECT:
        return 'Rejected';
      case this.VOID:
        return 'Void';
      case this.UNVOID:
        return 'Unvoid';
      case this.SW1:
        return 'Completed';
      case this.SW2:
        return 'Waiting for D4-D8';
      case this.DRAFT:
        return 'Draft';
      case this.MERGE:
        return 'Merge Case';
      default:
        return 'Requesting';
    }
  }
}
