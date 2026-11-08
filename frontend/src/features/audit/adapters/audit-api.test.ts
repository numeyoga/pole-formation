import { test,expect } from 'vitest';
import { eventView } from './audit-api';
test('audit mapping presents immutable snapshots with localized states and an explicit UTC date',()=>{
  expect(eventView({sequence:'12',id:'event-1',occurredAt:'2026-11-08T10:00:00Z',actor:'admin',action:'CORRECTION_PRESENCE',subjectType:'PARTICIPATION',subjectId:'participation-1',sessionId:null,before:{state:'PRESENTE'},after:{state:'ABSENTE'}})).toEqual({id:'event-1',date:'08/11/2026 10:00:00',actor:'admin',action:'Correction de présence après clôture',target:'Participation participation-1',before:['État : Présente'],after:['État : Absente']});
});
