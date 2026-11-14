import createClient from 'openapi-fetch';
import type {paths as ActivityPaths} from '../../../shared/http/activity-generated';
import type {paths as AuditPaths} from '../../../shared/http/audit-generated';
import {ApiError,csrfHeaders} from '../../../shared/http/session';
import {messages} from '../../../shared/i18n/fr';
const activity=createClient<ActivityPaths>({credentials:'same-origin'});
const audit=createClient<AuditPaths>({credentials:'same-origin'});
export class ParticipationError extends ApiError {constructor(status:number,message:string,public conflicts:string[]=[]){super(status,message);}}
async function unwrap<T>(result:{data?:T;error?:unknown;response:Response}):Promise<T>{if(!result.response.ok){const error=result.error as {detail?:string;confirmationRequired?:boolean;conflictingSessionIds?:string[]}|undefined;throw new ParticipationError(result.response.status,result.response.status===403?messages.forbidden:result.response.status===401?messages.expired:error?.detail??messages.network,error?.confirmationRequired?error.conflictingSessionIds??[]:[]);}return result.data as T;}
export const participationsApi={
 async enroll(session:string,collaboratorId:string,confirmConflicts=false){return unwrap(await activity.POST('/api/sessions/{session}/participants',{params:{path:{session},header:await csrfHeaders()},body:{collaboratorId,confirmConflicts}}));},
 async transition(session:string,participation:string,state:'INSCRITE'|'DESISTEE',confirmConflicts=false){await unwrap(await audit.PUT('/api/sessions/{session}/participants/{participation}/etat',{params:{path:{session,participation},header:await csrfHeaders()},body:{state,confirmConflicts}}));},
};
