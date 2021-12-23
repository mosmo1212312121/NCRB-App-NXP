import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAppState } from '../store/store';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class BoardGroupService extends BaseService {
  constructor(private store: Store<IAppState>, private http: HttpClient) {
    super();
    this.setHttpCli(this.http);
  }

  /**
   *
   * @param ncrbId
   * @param groupId
   * @param lotId
   * @param approver
   * @returns
   */
  public approveBoardNCRB(ncrbId: number, groupReqId: number, approver: string) {
    return this.post(`/api/boardgroup/ApproveNCRB`, { groupReqId, ncrbId, approver });
  }

  /**
   *
   * @param ncrbId
   * @param groupId
   * @param lotId
   * @param approver
   * @returns
   */
  public rejectBoardNCRB(ncrbId: number, groupReqId: number, approver: string) {
    return this.post(`/api/boardgroup/RejectNCRB`, { groupReqId, ncrbId, approver });
  }

  /**
   *
   * @param groupId
   * @param ncrbId
   * @param needDevice
   * @param needQrb
   * @param needMrb
   * @returns
   */
  public createBoardNCRB(groupId: number, ncrbId: number, needDevice: boolean, needQrb: boolean, needMrb: boolean) {
    return this.post(`/api/boardgroup/CreateNCRB`, { groupId, ncrbId, needDevice, needQrb, needMrb });
  }

  /**
   *
   * @param ncrbId
   * @param groupId
   * @param lotId
   * @param approver
   * @returns
   */
  public approveBoardLotInstruction(ncrbId: number, groupId: number, lotId: string, approver: string) {
    return this.post(`/api/boardgroup/ApproveLotInstruction`, { groupId, ncrbId, lotId, approver });
  }

  /**
   *
   * @param ncrbId
   * @param groupId
   * @param lotId
   * @param approver
   * @returns
   */
  public rejectBoardLotInstruction(ncrbId: number, lotId: string, approver: string) {
    return this.post(`/api/boardgroup/RejectLotInstruction`, { ncrbId, lotId, approver });
  }

  /**
   *
   * @param groupId
   * @param ncrbId
   * @param lotId
   * @param needDevice
   * @param needQrb
   * @param needMrb
   * @returns
   */
  public createBoardLotInstruction(
    groupId: number,
    ncrbId: number,
    lotId: string,
    needDevice: boolean,
    needQrb: boolean,
    needMrb: boolean
  ) {
    return this.post(`/api/boardgroup/CreateLotInstruction`, { groupId, ncrbId, lotId, needDevice, needQrb, needMrb });
  }

  /**
   *
   * @param ncrbId
   * @param lotName
   * @returns
   */
  public getBoardLotInstruction(ncrbId: number, lotId: string) {
    return this.post(`/api/boardgroup/GetLotInstruction`, { ncrbId, lotId });
  }

  /**
   *
   * @param ncrbId
   * @returns
   */
  public getBoardNCRB(ncrbId: number) {
    return this.post(`/api/boardgroup/GetNCRB`, { ncrbId });
  }

  /**
   *
   * @param ncrbId
   * @returns
   */
  public getBoardLotInstructions(ncrbId: number) {
    return this.post(`/api/boardgroup/GetLotInstructions`, { ncrbId });
  }

  /**
   *
   * @returns
   */
  public getBoardGroupMasterAll() {
    return this.get(`/api/boardgroup/GetMasterAll`);
  }

  /**
   *
   * @param page
   * @param pageLength
   * @param orderBy
   * @param orderFrom
   * @param startDate
   * @param endDate
   * @param searching
   * @returns
   */
  public getBoardGroupMaster(
    page: number,
    pageLength: number,
    orderBy: string,
    orderFrom: string,
    startDate: string = null,
    endDate: string = null,
    searching: string = ''
  ) {
    return this.post(`/api/boardgroup/GetMaster`, {
      page,
      pageLength,
      orderBy,
      orderFrom,
      startDate,
      endDate,
      groupName: searching
    });
  }

  /**
   *
   * @param groupMasterId
   * @returns
   */
  public getBoardGroupMasterById(groupMasterId: string) {
    return this.get(`/api/boardgroup/GetMasterById/${groupMasterId}`);
  }

  /**
   *
   * @param groupMaster
   * @returns
   */
  public saveBoardGroupMaster(groupMaster: string) {
    return this.post(`/api/boardgroup/CreateMaster`, groupMaster);
  }

  /**
   *
   * @param groupMasterId
   * @param groupMaster
   * @returns
   */
  public updateBoardGroupMaster(groupMasterId: string, groupMaster: any) {
    return this.put(`/api/boardgroup/UpdateMaster/${groupMasterId}`, groupMaster);
  }

  /**
   *
   * @param groupMasterId
   * @returns
   */
  public deleteBoardGroupMaster(groupMasterId: string) {
    return this.delete(`/api/boardgroup/DeleteMaster/${groupMasterId}`);
  }

  /**
   *
   * @param groupId
   * @returns
   */
  public getBoardGroup(groupId: string) {
    return this.get(`/api/boardgroup/GetGroup/${groupId}`);
  }

  /**
   *
   * @param mfg
   * @param subMfg
   * @returns
   */
  public getBoardGroupBySubMfg(mfg: string, subMfg: string) {
    return this.post(`/api/boardgroup/GetBySubMfg`, {
      mfg: parseInt(mfg, 10),
      subMfg: parseInt(subMfg, 10)
    });
  }

  /**
   *
   * @param page
   * @param pageLength
   * @param orderBy
   * @param orderFrom
   * @param startDate
   * @param endDate
   * @param searching
   * @returns
   */
  public getBoardGroups(
    page: number,
    pageLength: number,
    orderBy: string,
    orderFrom: string,
    startDate: string = null,
    endDate: string = null,
    searching: string = ''
  ) {
    return this.post(`/api/boardgroup/Get`, {
      page,
      pageLength,
      orderBy,
      orderFrom,
      startDate,
      endDate,
      groupName: searching
    });
  }

  /**
   *
   * @param groupId
   * @returns
   */
  public deleteBoardGroup(groupId: string) {
    return this.delete(`/api/boardgroup/Delete/${groupId}`);
  }

  /**
   *
   * @param boardGroup
   * @returns
   */
  public saveBoardGroup(boardGroup: any) {
    return this.post(`/api/boardgroup/Create`, boardGroup);
  }

  /**
   *
   * @param groupId
   * @param boardGroup
   * @returns
   */
  public updateBoardGroup(groupId: string, boardGroup: any) {
    return this.put(`/api/boardgroup/Update/${groupId}`, boardGroup);
  }

  /**
   *
   * @param memberId
   * @returns
   */
  public deleteBoardMember(memberId: string) {
    return this.delete(`/api/boardgroup/DeleteMember/${memberId}`);
  }

  /**
   *
   * @param boardGroup
   * @returns
   */
  public saveBoardMember(boardGroup: any) {
    return this.post(`/api/boardgroup/CreateMember`, boardGroup);
  }

  /**
   *
   * @param memberId
   * @param boardMember
   * @returns
   */
  public updateBoardMember(memberId: string, boardMember: any) {
    return this.put(`/api/boardgroup/UpdateMember/${memberId}`, boardMember);
  }
}
