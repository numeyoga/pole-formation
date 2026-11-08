import createClient from 'openapi-fetch';
import type { paths,components } from '../../../shared/http/subdomains-generated';
import type { SubdomainView,SubdomainPage,ParentOption,CompetencyView } from '../presentation/models';
import { ApiError,csrfHeaders } from '../../../shared/http/session';
import { messages } from '../../../shared/i18n/fr';

const client=createClient<paths>({credentials:'same-origin'});
export function subdomainView(dto:components['schemas']['Subdomain']):SubdomainView{
  return {id:dto.id,domainId:dto.domainId,code:dto.code,label:dto.label,active:dto.active,version:dto.version,status:dto.active?'Actif':'Désactivé',parentCode:dto.domainCode,parentLabel:dto.domainLabel,parentStatus:dto.domainActive?'Actif':'Désactivé'};
}
export class SubdomainError extends ApiError {constructor(status:number,message:string,public fields:Record<string,string>={}){super(status,message);}}
async function unwrap<T>(result:{data?:T;error?:unknown;response:Response}):Promise<T>{
  if(!result.response.ok){const error=result.error as {detail?:string;fieldErrors?:Record<string,string>}|undefined;
    throw new SubdomainError(result.response.status,result.response.status===403?messages.forbidden:result.response.status===401?messages.expired:error?.detail??messages.network,error?.fieldErrors??{});}
  return result.data as T;
}
export const subdomainsApi={
  async list(page=0,domainId?:string):Promise<SubdomainPage>{
    const result=await unwrap(await client.GET('/api/referentiels/sous-domaines',{params:{query:{page,size:10,domainId}}}));
    return {...result,items:result.items.map(subdomainView)};
  },
  async parents():Promise<ParentOption[]>{return (await unwrap(await client.GET('/api/referentiels/sous-domaines/parents'))).map(p=>({id:p.id,label:`${p.code} — ${p.label}${p.active?'':' (désactivé)'}`,selectableForCreation:p.selectableForCreation}));},
  async get(id:string):Promise<SubdomainView>{return subdomainView(await unwrap(await client.GET('/api/referentiels/sous-domaines/{id}',{params:{path:{id}}})));},
  async create(domainId:string,code:string,label:string){return subdomainView(await unwrap(await client.POST('/api/referentiels/sous-domaines',{params:{header:await csrfHeaders()},body:{domainId,code,label}})));},
  async update(item:SubdomainView,code:string,label:string){await unwrap(await client.PUT('/api/referentiels/sous-domaines/{id}',{params:{path:{id:item.id},header:await csrfHeaders()},body:{code,label,version:item.version}}));},
  async deactivate(item:SubdomainView){await unwrap(await client.POST('/api/referentiels/sous-domaines/{id}/desactivation',{params:{path:{id:item.id},header:await csrfHeaders()},body:{version:item.version}}));},
  async competencies(id:string):Promise<CompetencyView[]>{return (await unwrap(await client.GET('/api/referentiels/sous-domaines/{id}/competences',{params:{path:{id}}}))).map(({id,label})=>({id,label}));},
};
