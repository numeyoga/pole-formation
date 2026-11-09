import createClient from 'openapi-fetch';
import type { paths,components } from '../../../shared/http/formations-generated';
import type { FormationView,FormationPage,FormationFields,FormationAction,FormationSession } from '../presentation/models';
import { ApiError,csrfHeaders } from '../../../shared/http/session';
import { messages,states } from '../../../shared/i18n/fr';
const client=createClient<paths>({credentials:'same-origin'});
export class FormationError extends ApiError {constructor(status:number,message:string,public fields:Record<string,string>={}){super(status,message);}}
export function formationView(dto:components['schemas']['Formation']):FormationView {
  return {id:dto.id,code:dto.code,title:dto.title,objectives:dto.objectives??'',description:dto.description??'',durationMinutes:dto.durationMinutes??null,state:dto.state,status:states[dto.state],version:dto.version};
}
async function unwrap<T>(result:{data?:T;error?:unknown;response:Response}):Promise<T>{
  if(!result.response.ok){const error=result.error as {detail?:string;fieldErrors?:Record<string,string>}|undefined;
    throw new FormationError(result.response.status,result.response.status===403?messages.forbidden:result.response.status===401?messages.expired:error?.detail??messages.network,error?.fieldErrors??{});}
  return result.data as T;
}
const transitions={activation:'/api/formations/{id}/activation',archivage:'/api/formations/{id}/archivage',reactivation:'/api/formations/{id}/reactivation'} as const;
export const formationsApi={
  async list(page=0):Promise<FormationPage>{const result=await unwrap(await client.GET('/api/formations',{params:{query:{page,size:10}}}));return {...result,items:result.items.map(formationView)};},
  async get(id:string):Promise<FormationView>{return formationView(await unwrap(await client.GET('/api/formations/{id}',{params:{path:{id}}})));},
  async create(fields:FormationFields){return formationView(await unwrap(await client.POST('/api/formations',{params:{header:await csrfHeaders()},body:fields})));},
  async update(item:FormationView,fields:FormationFields){await unwrap(await client.PUT('/api/formations/{id}',{params:{path:{id:item.id},header:await csrfHeaders()},body:{...fields,version:item.version}}));},
  async transition(item:FormationView,action:FormationAction){await unwrap(await client.POST(transitions[action],{params:{path:{id:item.id},header:await csrfHeaders()},body:{version:item.version}}));},
  async sessions(id:string):Promise<FormationSession[]>{return (await unwrap(await client.GET('/api/formations/{id}/sessions',{params:{path:{id}}}))).map(item=>({id:item.id,title:item.title,status:states[item.state]}));},
};
