import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  ContainmentAction,
  ContainmentActionCa,
  CorrectiveActionPCa,
  FailureEscape,
  Initial,
  Lot,
  LotMaterial,
  Minute,
  PreventRecurrencePr,
  ResponseObj,
  Score,
  User
} from '../interfaces';
import { IAppState } from '../store/store';
import { BaseService } from './base.service';

const URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class AjaxService extends BaseService {
  constructor(private store: Store<IAppState>, private http: HttpClient) {
    super();
    this.setHttpCli(this.http);
  }

  public getPromiseAll(promises: Promise<any>[]) {
    return Promise.all(promises);
  }

  /**
   *
   * @param lotName
   * @param holdReason
   * @param holdComment
   * @param ncnumber
   * @returns
   */
  public onLotHold(lotName: string, holdReason: string, holdComment: string, ncnumber: string) {
    return this.put(`/api/main/GetHoldLot/${lotName}`, { holdReason, holdComment, ncnumber });
  }

  /**
   *
   * @param lotName
   * @returns
   */
  public onLotRelease(lotName: string) {
    return this.get(`/api/main/GetReleaseLot/${lotName}`);
  }

  /**
   *
   * @param request
   * @returns
   */
  public updateMats(request: Initial) {
    return this.post(`/api/main/UpdateMaterials`, request);
  }

  /**
   *
   * @returns
   */
  public getLatestRequest() {
    return this.get(`/api/main/GetLatestRequest`);
  }

  /**
   *
   * @param ncrbid
   * @param ncrbno
   * @returns
   */
  public removeAll(ncrbid: number, ncrbno: string) {
    return this.delete(`/api/main/RemoveAll/${ncrbid}/${ncrbno}`);
  }

  /**
   *
   * @param id
   * @param ncrbNo
   * @param userName
   * @returns
   */
  public removeOwner(id: number, ncrbNo: string, userName: string) {
    return this.post(`/api/main/RemoveOwner`, { id, ncrbNo, userName });
  }

  /**
   *
   * @param ncrbid
   * @param ncrbno
   * @param username
   * @param name
   * @returns
   */
  public addOwner(ncrbid: number, ncrbno: string, username: string, name: string) {
    return this.post(`/api/main/AddOwner`, { ncrbid, ncrbno, username, name });
  }

  /**
   *
   * @param ncrbid
   * @param ncrbno
   * @returns
   */
  public deleteRequest(ncrbid: number, ncrbno: string) {
    return this.delete(`/api/admin/DeleteRequest/${ncrbid}/${ncrbno}`);
  }

  /**
   *
   * @param ncrbno
   * @returns
   */
  public getHistoryByNcrbno(ncrbno: string) {
    return this.get(`/api/main/GetHistoryByNcrbno/${ncrbno}`);
  }

  /**
   *
   * @param fileName
   * @returns
   */
  public getMassUpload(fileName: string) {
    return this.get(`/api/main/GetMassUpload/${fileName}`);
  }

  /**
   *
   * @param actionId
   * @param username
   * @param form
   * @returns
   */
  public getStartFollowUp(actionId: number, username: string, form: string = 'D3') {
    return this.put(`/api/flow/GetStartFollowUp/${actionId}`, { username, rolename: form });
  }

  /**
   *
   * @param ncrbno
   * @param materials
   * @returns
   */
  public getSubmitMatDispositionAll(ncrbno: string, materials: LotMaterial[]) {
    return this.put(`/api/main/SubmitMatDispositionAll/${ncrbno}`, { materials });
  }

  /**
   *
   * @param ncrbno
   * @param auth
   * @param mats
   * @returns
   */
  public getMatDispositionApproveAll(ncrbno: string, auth: string, mats: LotMaterial[]) {
    return this.put(`/api/flow/GetMatDispositionApproveAll/${ncrbno}`, { mats, auth });
  }

  /**
   *
   * @param ncrbno
   * @param auth
   * @param mats
   * @returns
   */
  public getMatDispositionRejectAll(ncrbno: string, auth: string, mats: LotMaterial[]) {
    return this.put(`/api/flow/GetMatDispositionRejectAll/${ncrbno}`, { mats, auth });
  }

  /**
   *
   * @param id
   * @param material
   * @returns
   */
  public getSubmitMatDisposition(id: number, material: LotMaterial) {
    return this.put(`/api/main/SubmitMatDisposition/${id}`, { material });
  }

  /**
   *
   * @param lots
   * @returns
   */
  public getSubmitCosts(lots: Lot[]) {
    return this.post(`/api/main/GetSubmitCosts`, { lots });
  }

  /**
   *
   * @param ncrbno
   * @returns
   */
  public getLots(ncrbno: string) {
    return this.get(`/api/main/GetLots/${ncrbno}`);
  }

  /**
   *
   * @param ncrbno
   * @returns
   */
  public getLotsHist(ncrbno: string) {
    return this.get(`/api/main/GetLotsHist/${ncrbno}`);
  }

  /**
   *
   * @param ncrbno
   * @param lots
   * @returns
   */
  public getSubmitLotDispositionAll(ncrbno: string, lots: Lot[]) {
    return this.put(`/api/main/SubmitLotDispositionAll/${ncrbno}`, { lots });
  }

  /**
   *
   * @param ncrbno
   * @param lots
   * @returns
   */
  public getFuQaApprovalAll(ncrbno: string, lots: Lot[]) {
    return this.put(`/api/main/GetFuQaApprovalAll/${ncrbno}`, { lots });
  }

  /**
   *
   * @param ncrbno
   * @param lots
   * @returns
   */
  public getPemQaApprovalAll(ncrbno: string, lots: Lot[]) {
    return this.put(`/api/main/GetPemQaApprovalAll/${ncrbno}`, { lots });
  }

  /**
   *
   * @param ncrbno
   * @param lots
   * @returns
   */
  public getEngineerApprovalAll(ncrbno: string, lots: Lot[]) {
    return this.put(`/api/main/GetEngineerApproveAll/${ncrbno}`, { lots });
  }

  /**
   *
   * @param ncrbno
   * @param lots
   * @returns
   */
  public getEngineerScrapAll(ncrbno: string, lots: Lot[]) {
    return this.put(`/api/main/GetEngineerScrapAll/${ncrbno}`, { lots });
  }

  /**
   *
   * @param ncrbno
   * @param lots
   * @returns
   */
  public getEngineerRejectAll(ncrbno: string, lots: Lot[]) {
    return this.put(`/api/main/GetRejectAll/${ncrbno}`, { lots });
  }

  /**
   *
   * @param ncrbno
   * @param lots
   * @returns
   */
  public getMteApprovalAll(ncrbno: string, lots: Lot[]) {
    return this.put(`/api/main/GetPeTeApproveAll/${ncrbno}`, { lots });
  }

  /**
   *
   * @param ncrbno
   * @param lots
   * @returns
   */
  public getMteRejectAll(ncrbno: string, lots: Lot[]) {
    return this.put(`/api/main/GetRejectAll/${ncrbno}`, { lots });
  }

  /**
   *
   * @param role
   * @returns
   */
  public addRole(role: any) {
    return this.post(`/api/admin/AddRole/`, role);
  }

  /**
   *
   * @param ncrbno
   * @param lots
   * @returns
   */
  public getFuQaRejectAll(ncrbno: string, lots: Lot[]) {
    return this.put(`/api/main/GetRejectAll/${ncrbno}`, { lots });
  }

  /**
   *
   * @param ncrbno
   * @param lots
   * @returns
   */
  public getPemQaRejectAll(ncrbno: string, lots: Lot[]) {
    return this.put(`/api/main/GetRejectAll/${ncrbno}`, { lots });
  }

  /**
   *
   * @param id
   * @param lot
   * @returns
   */
  public getSubmitLotFuByQaUpdate(id: number, lot: Lot) {
    return this.put(`/api/main/SubmitLotFuByQaUpdate/${id}`, { lot });
  }

  /**
   *
   * @param id
   * @param lot
   * @returns
   */
  public getSubmitLotDispositionUpdate(id: number, lot: Lot) {
    return this.put(`/api/main/SubmitLotDispositionUpdate/${id}`, { lot });
  }

  /**
   *
   * @param id
   * @param lot
   * @returns
   */
  public getSubmitLotDisposition(id: number, lot: Lot) {
    return this.put(`/api/main/SubmitLotDisposition/${id}`, { lot });
  }

  /**
   *
   * @param status
   * @param page
   * @param pageLength
   * @param orderBy
   * @param orderFrom
   * @param startDate
   * @param endDate
   * @param searching
   * @param subMfg
   * @returns
   */
  public getRequestsByStatus(
    status: string,
    page: number,
    pageLength: number,
    orderBy: string,
    orderFrom: string,
    startDate: string,
    endDate: string,
    ncrbNumber: string = '',
    mfg: any,
    subMfg: any,
    assyCg: string = ''
  ) {
    return this.post(`/api/main/GetRequestsByStatus`, {
      status,
      page,
      pageLength,
      orderBy,
      orderFrom,
      dateStart: startDate,
      dateEnd: endDate,
      mfg: mfg,
      subMfg: subMfg,
      ncrbNo: ncrbNumber,
      assyCg: assyCg
    });
  }

  /**
   *
   * @param ncrbno
   * @returns
   */
  public getMembers(ncrbno: string) {
    return this.get(`/api/main/GetMembers/${ncrbno}`);
  }

  public removeMember(id: number, userName: string, ncrbNo: string) {
    return this.post(`/api/main/RemoveMember/`, { id, userName, ncrbNo });
  }

  public saveMember(empId: string, ncrbNo: string, createBy: string) {
    return this.post(`/api/main/SaveMember/`, { empId, ncrbNo, createBy });
  }

  public saveOwners(data: any) {
    return this.post(`/api/admin/SaveOwners/`, data);
  }

  public getUserById(empId: string) {
    return this.post(`/api/hrms/GetUserById/`, { empId });
  }

  public getSupervisorById(empId: string) {
    return this.get(`/api/hrms/GetSupervisorById/${empId}`);
  }

  public getSummary() {
    return this.get(`/api/dashboard/GetSummary`);
  }

  public createUserGroup(user: User) {
    return this.post(`/api/admin/CreateUserGroup`, user);
  }

  public updateUserGroup(user: User) {
    return this.post(`/api/admin/UpdateUserGroup`, user);
  }

  public deleteUserGroup(ugid: number) {
    return this.delete(`/api/admin/DeleteUserGroup/${ugid}`);
  }

  public getUsersGroups() {
    return this.get(`/api/admin/GetUsersGroups`);
  }

  public getUsersByRoleName(id: string) {
    return this.get(`/api/hrms/GetUsersByRoleName/${id}`);
  }

  public getOwnerPaginationNew(pageLength: number, mfg: string, subMfg: string, problemProcess: string) {
    return this.post(`/api/admin/GetOwnerPaginationNew`, { pageLength, mfg, subMfg, problemProcess });
  }

  public getOwnerPagination(pageLength: number, search: string = '') {
    return this.post(`/api/admin/GetOwnerPagination`, { pageLength, search });
  }

  public getOwnersByPagingNew(page: number, pageLength: number, mfg: string, subMfg: string, problemProcess: string) {
    return this.post(`/api/admin/GetOwnersByPagingNew`, { page, pageLength, mfg, subMfg, problemProcess });
  }

  public getOwnersByPaging(page: number, pageLength: number, search: string = '') {
    return this.post(`/api/admin/GetOwnersByPaging`, { page, pageLength, search });
  }

  public getOwners() {
    return this.get(`/api/admin/GetOwners`);
  }

  public getOwner(processId: string) {
    return this.get(`/api/admin/GetOwner/${processId}`);
  }

  public removeMom(mom: Minute) {
    return this.post(`/api/main/RemoveMom`, mom);
  }

  public saveMom(mom: Minute) {
    return this.post(`/api/main/SaveMom`, mom);
  }

  public getMoms(ncrbno: string) {
    return this.get(`/api/main/GetMoms/${ncrbno}`);
  }

  public getFile(fileId: number, fileName: string) {
    return this.file(`/file/Download/${fileId}`).pipe(
      map(blob => {
        this.downloadFile(blob, fileName);
        return blob;
      }),
      catchError(this.handleError)
    );
  }

  public getTemplate(fileName: string) {
    return this.file(`/Images/${fileName}`).pipe(
      map(blob => {
        this.downloadFile(blob, fileName);
        return blob;
      }),
      catchError(this.handleError)
    );
  }

  public getOwnerSQLFile(filename: string) {
    return this.file(`/file/OwnersDownloadSQL`).pipe(
      map(blob => {
        this.downloadFile(blob, filename);
        return blob;
      }),
      catchError(this.handleError)
    );
  }

  public removeFile(fileName) {
    return this.post(`/file/RemoveFile`, { fileName });
  }

  public removeFiles(id, ncrbid, formName, fileName) {
    return this.post(`/file/RemoveFile`, { id, ncrbid, formName, fileName });
  }

  public uploadFile(formData) {
    return this.post(`/file/UploadFile`, formData);
  }

  public uploadOwner(formData) {
    return this.post(`/file/UploadOwner`, formData);
  }

  public uploadBoardMember(formData) {
    return this.post(`/file/UploadBoardMember`, formData);
  }

  public uploadOwners(path) {
    return this.post(`/file/UploadOwners`, { path });
  }

  public uploadOwnersProgress() {
    return this.post(`/file/UploadOwnersProgress`, null);
  }

  public uploadBoardMembers(path) {
    return this.post(`/file/UploadBoardMembers`, { path });
  }

  public getContainmentAction(ncrbno: string, section: string) {
    return this.get(`/api/main/GetContainmentAction/${ncrbno}/${section}`);
  }

  public getContainmentActionCaById(id: string) {
    return this.get(`/api/main/GetContainmentActionCaById/${id}`);
  }

  public getCorrectiveActionPCaById(id: string) {
    return this.get(`/api/main/GetCorrectiveActionPCaById/${id}`);
  }

  public getPreventRecurrencePrById(id: string) {
    return this.get(`/api/main/GetPreventRecurrencePrById/${id}`);
  }

  public getContainmentActionCa(ncrbid: number) {
    return this.get(`/api/main/GetContainmentActionCa/${ncrbid}`);
  }

  public getCorrectiveActionPCa(ncrbid: number) {
    return this.get(`/api/main/GetCorrectiveActionPCa/${ncrbid}`);
  }

  public getPreventRecurrencePr(ncrbid: number) {
    return this.get(`/api/main/GetPreventRecurrencePr/${ncrbid}`);
  }

  public saveContainmentAction(ncrbno: string, ca: ContainmentAction) {
    return this.put(`/api/main/SaveContainmentAction/${ncrbno}`, ca);
  }

  public getFailureEscape(ncrbno: string) {
    return this.get(`/api/main/GetFailureEscape/${ncrbno}`);
  }

  public saveFailureEscape(fe: FailureEscape) {
    return this.post(`/api/main/SaveFailureEscape`, fe);
  }

  public saveContainmentActionCa(ncrbid: number, ca: ContainmentActionCa) {
    return this.put(`/api/main/SaveContainmentActionCa/${ncrbid}`, ca);
  }

  public saveCorrectiveActionPCa(ncrbid: number, ca: CorrectiveActionPCa) {
    return this.put(`/api/main/SaveCorrectiveActionPCa/${ncrbid}`, ca);
  }

  public savePreventRecurrencePr(ncrbid: number, ca: PreventRecurrencePr) {
    return this.put(`/api/main/SavePreventRecurrencePr/${ncrbid}`, ca);
  }

  public removeContainmentActionCa(actionId: number, userName: string) {
    return this.put(`/api/main/RemoveContainmentActionCa/${actionId}`, { userName });
  }

  public removeCorrectiveActionPCa(actionId: number, userName: string) {
    return this.put(`/api/main/RemoveCorrectiveActionPCa/${actionId}`, { userName });
  }

  public removePreventRecurrencePr(actionId: number, userName: string) {
    return this.put(`/api/main/RemovePreventRecurrencePr/${actionId}`, { userName });
  }

  public updateContainmentAction(ca: ContainmentActionCa) {
    return this.post(`/api/main/UpdateContainmentAction/`, ca);
  }

  public updateCorrectiveAction(ca: CorrectiveActionPCa) {
    return this.post(`/api/main/UpdateCorrectiveAction/`, ca);
  }

  public updatePreventRecurrenceAction(pr: PreventRecurrencePr) {
    return this.post(`/api/main/UpdatePreventRecurrenceAction/`, pr);
  }

  public getContainmentComplete(id: number, auth: string) {
    return this.put(`/api/flow/GetContainmentComplete/${id}`, { auth });
  }

  public getContainmentPostpone(id: number, auth: string) {
    return this.put(`/api/flow/GetContainmentPostpone/${id}`, { auth });
  }

  public getContainmentPostponeApprove(id: number, auth: string) {
    return this.put(`/api/flow/GetContainmentPostponeApprove/${id}`, { auth });
  }

  public getContainmentPostponeReject(id: number, auth: string) {
    return this.put(`/api/flow/GetContainmentPostponeReject/${id}`, { auth });
  }

  public getCorrectiveComplete(id: number, auth: string) {
    return this.put(`/api/flow/GetCorrectiveComplete/${id}`, { auth });
  }

  public getCorrectivePostpone(id: number, auth: string) {
    return this.put(`/api/flow/GetCorrectivePostpone/${id}`, { auth });
  }

  public getCorrectivePostponeApprove(id: number, auth: string) {
    return this.put(`/api/flow/GetCorrectivePostponeApprove/${id}`, { auth });
  }

  public getCorrectivePostponeReject(id: number, auth: string) {
    return this.put(`/api/flow/GetCorrectivePostponeReject/${id}`, { auth });
  }

  public getPreventRecurrenceComplete(id: number, auth: string) {
    return this.put(`/api/flow/GetPreventRecurrenceComplete/${id}`, { auth });
  }

  public getPreventRecurrencePostpone(id: number, auth: string) {
    return this.put(`/api/flow/GetPreventRecurrencePostpone/${id}`, { auth });
  }

  public getPreventRecurrencePostponeApprove(id: number, auth: string) {
    return this.put(`/api/flow/GetPreventRecurrencePostponeApprove/${id}`, { auth });
  }

  public getPreventRecurrencePostponeReject(id: number, auth: string) {
    return this.put(`/api/flow/GetPreventRecurrencePostponeReject/${id}`, { auth });
  }

  public getMatDispositionApprove(id: number, auth: string, mat: LotMaterial) {
    return this.put(`/api/flow/GetMatDispositionApprove/${id}`, { auth, mat });
  }

  public getMatDispositionReject(id: number, auth: string, mat: LotMaterial) {
    return this.put(`/api/flow/GetMatDispositionReject/${id}`, { auth, mat });
  }

  public getLotDispositionForEngineer(id: number, auth: string, lot: Lot) {
    return this.put(`/api/flow/GetLotDispositionForEngineer/${id}`, { auth, lot });
  }

  public getLotDispositionApproved(id: number, auth: string, lot: Lot) {
    return this.put(`/api/flow/GetLotDispositionApproved/${id}`, { auth, lot });
  }

  public getLotDispositionApprove(id: number, auth: string, lot: Lot) {
    return this.put(`/api/flow/GetLotDispositionApprove/${id}`, { auth, lot });
  }

  public getLotDispositionReject(id: number, auth: string, lot: Lot) {
    return this.put(`/api/flow/GetLotDispositionReject/${id}`, { auth, lot });
  }

  public getLotDispositionScrap(id: number, auth: string, lot: Lot) {
    return this.put(`/api/flow/GetLotDispositionScrap/${id}`, { auth, lot });
  }

  public getChangeOwner(id: number, owner: string, auth: string, isSubmit: boolean) {
    return this.put(`/api/flow/GetChangeOwner/${id}`, { auth, owner, isSubmit });
  }

  public getAcknowledge(id: number, auth: string) {
    return this.put(`/api/flow/GetAcknowledge/${id}`, { auth });
  }

  public getMerge(oldNcrbno: string, newNcrbno: string, name: string) {
    return this.put(`/api/main/GetMerge/${oldNcrbno}`, { name, ncrbno: newNcrbno });
  }

  public getSubmit(
    id: number,
    auth: string,
    PEMQAWBI: string,
    isD12D3: boolean,
    isD12D8: boolean,
    isD12D83x5Why: boolean
  ) {
    return this.put(`/api/flow/GetSubmit/${id}`, { auth, PEMQAWBI, isD12D3, isD12D8, isD12D83x5Why });
  }

  public getSubmit2Manager(
    id: number,
    auth: string,
    PEMQAWBI: string,
    isD12D3: boolean,
    isD12D8: boolean,
    isD12D83x5Why: boolean
  ) {
    return this.put(`/api/flow/GetSubmit2Manager/${id}`, {
      auth,
      PEMQAWBI,
      isD12D3,
      isD12D8,
      isD12D83x5Why
    });
  }

  public getCompleteNCRB(id: number, auth: string, isD12D3: boolean, isD12D8: boolean, isD12D83x5Why: boolean) {
    return this.put(`/api/flow/GetCompleteNCRB/${id}`, { auth, isD12D3, isD12D8, isD12D83x5Why });
  }

  public getSubmit2Board(id: number, auth: string, isD12D3: boolean, isD12D8: boolean, isD12D83x5Why: boolean) {
    return this.put(`/api/flow/GetSubmit2Board/${id}`, { auth, isD12D3, isD12D8, isD12D83x5Why });
  }

  public getSubmitPEMQA(id: number, obj: any) {
    return this.put(`/api/flow/GetSubmitPEMQA/${id}`, obj);
  }

  public saveRequest(data: Initial) {
    return this.post(`/api/main/SaveRequest`, data);
  }

  public saveDraftRequest(data: Initial) {
    return this.post(`/api/main/SaveDraftRequest`, data);
  }

  public submitDraftRequest(data: Initial) {
    return this.post(`/api/main/SubmitDraftRequest`, data);
  }

  public removeDraftRequest(data: Initial) {
    return this.post(`/api/main/RemoveDraftRequest`, data);
  }

  public updateScore(data: Score) {
    return this.post(`/api/main/UpdateScore`, data);
  }

  public getCalculateScore(data: Initial) {
    return this.post(`/api/main/GetCalculateScore`, data);
  }

  public getProberOne(lotName: string, spec: string, machine: string) {
    return this.get(`/api/main/GetProberOne/${lotName}/${spec}/${machine}`);
  }

  public getHandlerOne(lotName: string, spec: string, machine: string) {
    return this.get(`/api/main/GetHandlerOne/${lotName}/${spec}/${machine}`);
  }

  public getTesterOne(lotName: string, spec: string) {
    return this.get(`/api/main/GetTesterOne/${lotName}/${spec}`);
  }

  public getMachine(lots: Lot[], operationName: string) {
    return this.put(`/api/main/GetMachine/${operationName}`, lots);
  }

  public updateRole(id, req: any) {
    return this.put(`/api/admin/UpdateRole/${id}`, req);
  }

  public getMaterial(lots: LotMaterial[], phase: string, materialType: string) {
    return this.put(`/api/main/GetMaterial/${phase}/${materialType}`, lots);
  }

  public getLot(lotId: number) {
    return this.get(`/api/main/GetLot/${lotId}`);
  }

  public getMaterialById(matId: number) {
    return this.get(`/api/main/GetMaterialById/${matId}`);
  }

  public getLotInfo(lotName: string) {
    return this.get(`/api/main/GetLotInfo/${lotName}`);
  }

  public getWafers(lotName: string, workOrder: string) {
    return this.put(`/api/main/GetWafers/${lotName}`, { workOrder });
  }

  public getTrackInTrackOut(lot: Lot) {
    return this.post(`/api/main/GetTrackInTrackOut`, lot);
  }

  public getOperation(workflow: string) {
    return this.get(`/api/main/GetOperation/${workflow}`);
  }

  public getOperations(lotId: string) {
    return this.get(`/api/main/GetOperations/${lotId}`);
  }

  public getSubOrdersByLotId(lotId: string) {
    return this.get(`/api/main/GetSubOrdersByLotId/${lotId}`);
  }

  public getMaterialsBySubOrder(subOrder: string) {
    return this.get(`/api/main/GetMaterialsBySubOrder/${subOrder}`);
  }

  public getProcessSpecsBySubOrder(subOrder: string) {
    return this.get(`/api/main/GetProcessSpecsBySubOrder/${subOrder}`);
  }

  public getWorkflowsByProcessSpec(processSpec: string) {
    return this.get(`/api/main/GetWorkflowsByProcessSpec/${processSpec}`);
  }

  public getStepsByWorkflow(workflow: string) {
    return this.get(`/api/main/GetStepsByWorkflow/${workflow}`);
  }

  public updateEditing(id: number, user: string) {
    return this.put(`/api/main/UpdateEditing/${id}`, { name: user });
  }

  public checkEditingExpired(id: number, user: string) {
    return this.put(`/api/main/CheckEditingExpired/${id}`, { name: user });
  }

  public updateRequest(data: Initial) {
    return this.post(`/api/main/UpdateRequest`, data);
  }

  public updateLots(ncnumber: string, lots: Lot[], lotsRemove: number[], operation?: string) {
    return this.post(`/api/main/updateLots`, { ncnumber, lots, lotsRemove, operation: operation });
  }

  public getApproveInstruction(lots: Lot[]) {
    return this.post(`/api/main/GetApproveInstruction`, { lots });
  }

  public getRejectInstruction(lots: Lot[]) {
    return this.post(`/api/main/GetRejectInstruction`, { lots });
  }

  public saveInstruction(ncnumber: string, retest: boolean, rejectName: number, lots: Lot[]) {
    return this.post(`/api/main/saveInstruction`, { ncnumber, retest, rejectName, lots });
  }

  public getRequests() {
    return this.get(`/api/main/GetRequests`);
  }

  public getFirstRequest() {
    return this.get(`/api/main/GetFirstRequest`);
  }

  public getRequestsByCriterias(
    page: number,
    pageLength: number,
    orderBy: string,
    orderFrom: string,
    startDate: string,
    endDate: string,
    filter: any,
    subMfg: any
  ) {
    return this.post(`/api/main/GetRequestsByCriterias`, {
      page,
      pageLength,
      orderBy,
      orderFrom,
      dateStart: startDate,
      dateEnd: endDate,
      subMfg,
      ncrbNo: filter.ncrbNumber,
      mfg: filter.mfg,
      assyCg: filter.assyCg,
      failureCode: filter.failureCode,
      faCode: filter.faCode,
      status: filter.status,
      lotId: filter.lotId,
      productDescription: filter.productDescription
    });
  }

  public getMergable(
    ncrbId: number,
    page: number,
    ncrbNo: string,
    pageLength: number,
    orderBy: string,
    orderFrom: string,
    startDate: string = null,
    endDate: string = null
  ) {
    return this.post(`/api/main/GetMergable`, {
      ncrbId,
      ncrbNo,
      page,
      pageLength,
      orderBy,
      orderFrom,
      startDate,
      endDate
    });
  }

  public getRequestsByUserLogin(username: string) {
    return this.post(`/api/main/GetRequests`, { username });
  }

  public getRequestsByUserLoginByCriteria(
    userLogin: string,
    page: number,
    pageLength: number,
    orderBy: string,
    orderFrom: string,
    startDate: string,
    endDate: string,
    filter: any,
    subMfg: string,
    myType: string = 'issue'
  ) {
    return this.post(`/api/main/GetRequestsByUserLogin`, {
      page,
      pageLength,
      orderBy,
      orderFrom,
      dateStart: startDate,
      dateEnd: endDate,
      userLogin,
      requestType: myType,
      subMfg,
      ncrbNo: filter.ncrbNumber,
      mfg: filter.mfg,
      assyCg: filter.assyCg,
      failureCode: filter.failureCode,
      faCode: filter.faCode,
      status: filter.status,
      lotId: filter.lotId,
      productDescription: filter.productDescription
    });
  }

  public getRequest(id: number) {
    return this.get(`/api/main/GetRequest/${id}`);
  }

  public getRequestByNumber(ncrbno: string) {
    return this.get(`/api/main/GetRequestByNumber/${ncrbno}`);
  }

  public getNcNumber() {
    return this.get(`/api/main/GetNcNumber`);
  }

  public getRoles() {
    return this.get(`/api/admin/GetRoles`);
  }

  public getUsersAndRoles() {
    return this.get(`/api/admin/GetUsers`);
  }

  public getUserAndRoles(id: number) {
    return this.get(`/api/admin/GetUser/${id}`);
  }

  public getFindUser(id: string) {
    return this.get(`/api/admin/FindUser/${id}`);
  }

  public getUpdateRole(id: number, roles: any) {
    return this.put(`/api/admin/UpdateRole/${id}`, roles);
  }

  public getUsers() {
    const expireIn: number = parseInt(localStorage.getItem('expireIn'), 10);
    const users: User[] = JSON.parse(localStorage.getItem('users'));
    if (users && expireIn > new Date().getTime()) {
      return new Observable<ResponseObj>(obs => {
        obs.next({
          data: users,
          status: 200,
          statusText: 'IN-STORAGE',
          timing: 0.0
        });
        obs.complete();
      });
    } else {
      return this.get(`/api/hrms/GetUsers`);
    }
  }
}
