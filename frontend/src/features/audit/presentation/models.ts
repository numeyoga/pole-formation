export interface AuditEventView {
  id:string;
  date:string;
  actor:string;
  action:string;
  target:string;
  before:string[];
  after:string[];
}
export interface AuditPageView { items:AuditEventView[]; nextCursor:string|null }
export interface AuditFilters { subjectType?:'COMPTE'|'PARTICIPATION'|'CRENEAU'|'AFFECTATIONS'|'FORMATION'|'SESSION'; subjectId?:string; sessionId?:string }
