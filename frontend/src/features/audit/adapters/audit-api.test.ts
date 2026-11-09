import { test,expect } from 'vitest';
import { eventView } from './audit-api';
test('audit mapping presents immutable snapshots with localized states and an explicit UTC date',()=>{
  expect(eventView({sequence:'12',id:'event-1',occurredAt:'2026-11-08T10:00:00Z',actor:'admin',action:'CORRECTION_PRESENCE',subjectType:'PARTICIPATION',subjectId:'participation-1',sessionId:null,before:{state:'PRESENTE'},after:{state:'ABSENTE'}})).toEqual({id:'event-1',date:'08/11/2026 10:00:00',actor:'admin',action:'Correction de présence après clôture',target:'Participation participation-1',before:['État : Présente'],after:['État : Absente']});
});
test('formation lifecycle events are localized without losing before and after values',()=>{
 const view=eventView({sequence:'13',id:'event-formation',occurredAt:'2026-11-09T10:00:00Z',actor:'gestionnaire',action:'ARCHIVAGE_FORMATION',subjectType:'FORMATION',subjectId:'formation-1',sessionId:null,before:{state:'ACTIVE',durationMinutes:90},after:{state:'ARCHIVEE',durationMinutes:90}});
 expect(view.action).toBe('Archivage de formation');expect(view.target).toBe('Formation formation-1');expect(view.before).toEqual(['État : Active','Durée indicative (minutes) : 90']);expect(view.after).toEqual(['État : Archivée','Durée indicative (minutes) : 90']);
});
