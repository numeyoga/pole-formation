import createClient from 'openapi-fetch';
import type { components, paths } from '../../../shared/http/audit-generated';
import type { AuditEventView,AuditPageView,AuditFilters } from '../presentation/models';
import { ApiError } from '../../access/adapters/access-api';
import { messages, roles, states } from '../../../shared/i18n/fr';

const client=createClient<paths>({credentials:'same-origin'});
const actions:Record<string,string>={CREATION_FORMATION:'Création de formation',MODIFICATION_FORMATION:'Modification de formation',ACTIVATION_FORMATION:'Activation de formation',ARCHIVAGE_FORMATION:'Archivage de formation',REACTIVATION_FORMATION:'Réactivation de formation',CORRECTION_PRESENCE:'Correction de présence après clôture',CHANGEMENT_ROLE:'Changement de rôle',MODIFICATION_CRENEAU:'Modification de créneau',REMPLACEMENT_INTERVENANTS:'Remplacement des intervenants',DESISTEMENT:'Désistement',REACTIVATION_PARTICIPATION:'Réactivation de participation'};
const types:Record<string,string>={FORMATION:'Formation',COMPTE:'Compte',PARTICIPATION:'Participation',CRENEAU:'Créneau',AFFECTATIONS:'Affectations de session'};
const fields:Record<string,string>={code:'Code',title:'Intitulé',objectives:'Objectifs',description:'Description',durationMinutes:'Durée indicative (minutes)',version:'Version',state:'État',role:'Rôle',startsAt:'Début',endsAt:'Fin',instructorIds:'Intervenants'};
function value(value:unknown):string {
  if(Array.isArray(value))return value.map(item=>String(item)).join(', ')||'Aucun';
  if(typeof value==='string')return states[value]??(roles as Record<string,string>)[value]??value;
  return JSON.stringify(value);
}
export function eventView(dto:components['schemas']['Event']):AuditEventView {
  const snapshot=(data:Record<string,unknown>)=>Object.entries(data).map(([key,item])=>`${fields[key]??key} : ${value(item)}`);
  return {id:dto.id,date:new Intl.DateTimeFormat('fr-FR',{dateStyle:'short',timeStyle:'medium',timeZone:'UTC'}).format(new Date(dto.occurredAt)),
    actor:dto.actor,action:actions[dto.action]??dto.action,target:`${types[dto.subjectType]} ${dto.subjectId}`,
    before:snapshot(dto.before),after:snapshot(dto.after)};
}
export async function readAudit(filters:AuditFilters,cursor?:string):Promise<AuditPageView> {
  const result=await client.GET('/api/audit',{params:{query:{...filters,limit:10,...(cursor?{beforeSequence:cursor}:{})}}});
  if(!result.response.ok || !result.data)throw new ApiError(result.response.status,result.response.status===403?messages.forbidden:result.response.status===401?messages.expired:messages.network);
  return {items:result.data.items.map(eventView),nextCursor:result.data.nextCursor};
}
