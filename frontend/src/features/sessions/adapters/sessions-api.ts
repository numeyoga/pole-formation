import createClient from 'openapi-fetch';
import type {paths,components} from '../../../shared/http/sessions-generated';
import type {paths as FormationPaths} from '../../../shared/http/formations-generated';
import {ApiError,csrfHeaders} from '../../../shared/http/session';
import {messages,states,sessionMessages as m} from '../../../shared/i18n/fr';
import type {SessionView,SessionFields,SessionSummary} from '../presentation/models';
const client=createClient<paths>({credentials:'same-origin'});
const formations=createClient<FormationPaths>({credentials:'same-origin'});
export class SessionError extends ApiError {constructor(status:number,message:string,public fields:Record<string,string>={}){super(status,message);}}
async function unwrap<T>(result:{data?:T;error?:unknown;response:Response}):Promise<T>{
 if(!result.response.ok){const problem=result.error as {detail?:string;fieldErrors?:Record<string,string>}|undefined;throw new SessionError(result.response.status,result.response.status===403?messages.forbidden:result.response.status===401?messages.expired:problem?.detail??messages.network,problem?.fieldErrors??{});}
 return result.data as T;
}
const dateFormat=new Intl.DateTimeFormat('fr-FR',{dateStyle:'short',timeStyle:'short',timeZone:'UTC'});
export function sessionView(dto:components['schemas']['Session']):SessionView{
 return {id:dto.id,title:dto.title,state:dto.state,status:states[dto.state],version:dto.version,modalities:dto.modalities,
 capacityLabel:dto.capacity===null?m.unlimited:`${dto.capacity} ${m.places}`,slots:dto.slots.map(slot=>({id:slot.id,start:dateFormat.format(new Date(slot.startsAt))+' UTC',end:dateFormat.format(new Date(slot.endsAt))+' UTC'}))};
}
export const sessionsApi={
 async list(formationId:string):Promise<SessionSummary[]>{return (await unwrap(await formations.GET('/api/formations/{id}/sessions',{params:{path:{id:formationId}}}))).map(item=>({id:item.id,title:item.title,status:states[item.state]}));},
 async create(formationId:string,fields:SessionFields){return unwrap(await formations.POST('/api/formations/{id}/sessions',{params:{path:{id:formationId},header:await csrfHeaders()},body:fields}));},
 async get(id:string){return sessionView(await unwrap(await client.GET('/api/sessions/{id}',{params:{path:{id}}})));},
 async addSlot(item:SessionView,start:string,end:string,offset:string){await unwrap(await client.POST('/api/sessions/{id}/creneaux',{params:{path:{id:item.id},header:await csrfHeaders()},body:{startsAt:start+offset,endsAt:end+offset,version:item.version}}));},
 async plan(item:SessionView){await unwrap(await client.POST('/api/sessions/{id}/planification',{params:{path:{id:item.id},header:await csrfHeaders()},body:{version:item.version}}));},
};
