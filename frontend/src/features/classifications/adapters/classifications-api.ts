import createClient from 'openapi-fetch';
import type { paths,components } from '../../../shared/http/classifications-generated';
import type { ClassificationView,ClassificationPage } from '../presentation/models';
import { ApiError,csrfHeaders } from '../../../shared/http/session';
import { messages } from '../../../shared/i18n/fr';

const client=createClient<paths>({credentials:'same-origin'});
export class ClassificationError extends ApiError {
  constructor(status:number,message:string,public fields:Record<string,string>={}){super(status,message);}
}
export function classificationView(dto:components['schemas']['Classification']):ClassificationView{
  return {id:dto.id,code:dto.code,label:dto.label,sortOrder:dto.sortOrder,active:dto.active,version:dto.version,status:dto.active?'Actif':'Désactivé'};
}
async function unwrap<T>(result:{data?:T;error?:unknown;response:Response}):Promise<T>{
  if(!result.response.ok){const error=result.error as {detail?:string;fieldErrors?:Record<string,string>}|undefined;
    throw new ClassificationError(result.response.status,result.response.status===403?messages.forbidden:result.response.status===401?messages.expired:error?.detail??messages.network,error?.fieldErrors??{});}
  return result.data as T;
}
export const classificationsApi={
  async list(page=0):Promise<ClassificationPage>{const result=await unwrap(await client.GET('/api/referentiels/classifications',{params:{query:{page,size:10}}}));return {...result,items:result.items.map(classificationView)};},
  async get(id:string):Promise<ClassificationView>{return classificationView(await unwrap(await client.GET('/api/referentiels/classifications/{id}',{params:{path:{id}}})));},
  async create(code:string,label:string,sortOrder:number){return classificationView(await unwrap(await client.POST('/api/referentiels/classifications',{params:{header:await csrfHeaders()},body:{code,label,sortOrder}})));},
  async update(classification:ClassificationView,code:string,label:string,sortOrder:number){await unwrap(await client.PUT('/api/referentiels/classifications/{id}',{params:{path:{id:classification.id},header:await csrfHeaders()},body:{code,label,sortOrder,active:classification.active,version:classification.version}}));},
};
