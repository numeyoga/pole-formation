import createClient from 'openapi-fetch';
import type { paths,components } from '../../../shared/http/competencies-generated';
import type { CompetencyView,CompetencyPage,ParentOption } from '../presentation/models';
import { ApiError,csrfHeaders } from '../../../shared/http/session';
import { messages } from '../../../shared/i18n/fr';

const client=createClient<paths>({credentials:'same-origin'});
export function competencyView(dto:components['schemas']['Competency']):CompetencyView{
  return {id:dto.id,subdomainId:dto.subdomainId,code:dto.code,label:dto.label,active:dto.active,version:dto.version,status:dto.active?'Actif':'Désactivé',parentCode:dto.subdomainCode,parentLabel:dto.subdomainLabel,parentStatus:dto.subdomainActive?'Actif':'Désactivé'};
}
export class CompetencyError extends ApiError {constructor(status:number,message:string,public fields:Record<string,string>={}){super(status,message);}}
async function unwrap<T>(result:{data?:T;error?:unknown;response:Response}):Promise<T>{
  if(!result.response.ok){const error=result.error as {detail?:string;fieldErrors?:Record<string,string>}|undefined;
    throw new CompetencyError(result.response.status,result.response.status===403?messages.forbidden:result.response.status===401?messages.expired:error?.detail??messages.network,error?.fieldErrors??{});}
  return result.data as T;
}
export const competenciesApi={
  async list(page=0,subdomainId?:string):Promise<CompetencyPage>{
    const result=await unwrap(await client.GET('/api/referentiels/competences',{params:{query:{page,size:10,subdomainId}}}));
    return {...result,items:result.items.map(competencyView)};
  },
  async parents():Promise<ParentOption[]>{return (await unwrap(await client.GET('/api/referentiels/competences/parents'))).map(p=>({id:p.id,label:`${p.code} — ${p.label}${p.active?'':' (désactivé)'}`,selectableForCreation:p.selectableForCreation}));},
  async get(id:string):Promise<CompetencyView>{return competencyView(await unwrap(await client.GET('/api/referentiels/competences/{id}',{params:{path:{id}}})));},
  async create(subdomainId:string,code:string,label:string){return competencyView(await unwrap(await client.POST('/api/referentiels/competences',{params:{header:await csrfHeaders()},body:{subdomainId,code,label}})));},
  async update(item:CompetencyView,code:string,label:string){await unwrap(await client.PUT('/api/referentiels/competences/{id}',{params:{path:{id:item.id},header:await csrfHeaders()},body:{code,label,version:item.version}}));},
  async deactivate(item:CompetencyView){await unwrap(await client.POST('/api/referentiels/competences/{id}/desactivation',{params:{path:{id:item.id},header:await csrfHeaders()},body:{version:item.version}}));},
};
