import createClient from 'openapi-fetch';
import type { paths,components } from '../../../shared/http/domains-generated';
import type { DomainView,DomainPage,ChildView } from '../presentation/models';
import { ApiError,csrfHeaders } from '../../../shared/http/session';
import { messages } from '../../../shared/i18n/fr';

const client=createClient<paths>({credentials:'same-origin'});
export class DomainError extends ApiError {
  constructor(status:number,message:string,public fields:Record<string,string>={}){super(status,message);}
}
export function domainView(dto:components['schemas']['Domain']):DomainView{
  return {id:dto.id,code:dto.code,label:dto.label,active:dto.active,version:dto.version,status:dto.active?'Actif':'Désactivé'};
}
async function unwrap<T>(result:{data?:T;error?:unknown;response:Response}):Promise<T>{
  if(!result.response.ok){const error=result.error as {detail?:string;fieldErrors?:Record<string,string>}|undefined;
    throw new DomainError(result.response.status,result.response.status===403?messages.forbidden:result.response.status===401?messages.expired:error?.detail??messages.network,error?.fieldErrors??{});}
  return result.data as T;
}
export const domainsApi={
  async list(page=0):Promise<DomainPage>{const result=await unwrap(await client.GET('/api/referentiels/domaines',{params:{query:{page,size:10}}}));return {...result,items:result.items.map(domainView)};},
  async get(id:string):Promise<DomainView>{return domainView(await unwrap(await client.GET('/api/referentiels/domaines/{id}',{params:{path:{id}}})));},
  async create(code:string,label:string){return domainView(await unwrap(await client.POST('/api/referentiels/domaines',{params:{header:await csrfHeaders()},body:{code,label}})));},
  async update(domain:DomainView,code:string,label:string){await unwrap(await client.PUT('/api/referentiels/domaines/{id}',{params:{path:{id:domain.id},header:await csrfHeaders()},body:{code,label,version:domain.version}}));},
  async deactivate(domain:DomainView){await unwrap(await client.POST('/api/referentiels/domaines/{id}/desactivation',{params:{path:{id:domain.id},header:await csrfHeaders()},body:{version:domain.version}}));},
  async children(id:string):Promise<ChildView[]>{return (await unwrap(await client.GET('/api/referentiels/domaines/{id}/sous-domaines',{params:{path:{id}}}))).map(({id,label})=>({id,label}));},
};
