import createClient from 'openapi-fetch';
import type { paths,components } from '../../../shared/http/profiles-generated';
import type { ProfileView,ProfilePage,RequirementView,RequirementChoices } from '../presentation/models';
import { ApiError,csrfHeaders } from '../../../shared/http/session';
import { messages } from '../../../shared/i18n/fr';

import type { paths as ClassificationPaths } from '../../../shared/http/classifications-generated';
const classificationClient=createClient<ClassificationPaths>({credentials:'same-origin'});
const client=createClient<paths>({credentials:'same-origin'});
export class ProfileError extends ApiError {
  constructor(status:number,message:string,public fields:Record<string,string>={}){super(status,message);}
}
export function profileView(dto:components['schemas']['Profile']):ProfileView{
  return {id:dto.id,code:dto.code,label:dto.label,description:dto.description,active:dto.active,version:dto.version,status:dto.active?'Actif':'Désactivé'};
}
async function unwrap<T>(result:{data?:T;error?:unknown;response:Response}):Promise<T>{
  if(!result.response.ok){const error=result.error as {detail?:string;fieldErrors?:Record<string,string>}|undefined;
    throw new ProfileError(result.response.status,result.response.status===403?messages.forbidden:result.response.status===401?messages.expired:error?.detail??messages.network,error?.fieldErrors??{});}
  return result.data as T;
}
export const profilesApi={
  async list(page=0):Promise<ProfilePage>{const result=await unwrap(await client.GET('/api/referentiels/profils-emploi',{params:{query:{page,size:10}}}));return {...result,items:result.items.map(profileView)};},
  async get(id:string):Promise<ProfileView>{return profileView(await unwrap(await client.GET('/api/referentiels/profils-emploi/{id}',{params:{path:{id}}})));},
  async create(code:string,label:string,description:string){return profileView(await unwrap(await client.POST('/api/referentiels/profils-emploi',{params:{header:await csrfHeaders()},body:{code,label,description}})));},
  async update(profile:ProfileView,code:string,label:string,description:string){await unwrap(await client.PUT('/api/referentiels/profils-emploi/{id}',{params:{path:{id:profile.id},header:await csrfHeaders()},body:{code,label,description,version:profile.version}}));},
  async deactivate(profile:ProfileView){await unwrap(await client.POST('/api/referentiels/profils-emploi/{id}/desactivation',{params:{path:{id:profile.id},header:await csrfHeaders()},body:{version:profile.version}}));},
  async competencyChoices(q='',page=0):Promise<RequirementChoices>{const result=await unwrap(await client.GET('/api/referentiels/profils-emploi/competences-disponibles',{params:{query:{q,page,size:10}}}));return {...result,items:result.items.map(item=>({id:item.id,label:`${item.code} — ${item.label}`}))};},
  async classificationChoices(page=0):Promise<RequirementChoices>{const result=await unwrap(await classificationClient.GET('/api/referentiels/classifications',{params:{query:{page,size:10,activeOnly:true}}}));return {...result,items:result.items.map(item=>({id:item.id,label:`${item.code} — ${item.label}`}))};},
  async addRequirement(profileId:string,competencyId:string,classificationId:string){return unwrap(await client.POST('/api/referentiels/profils-emploi/{id}/exigences',{params:{path:{id:profileId},header:await csrfHeaders()},body:{competencyId,classificationId}}));},
  async reclassify(profileId:string,item:RequirementView,classificationId:string){await unwrap(await client.PUT('/api/referentiels/profils-emploi/{id}/exigences/{requirementId}',{params:{path:{id:profileId,requirementId:item.id},header:await csrfHeaders()},body:{classificationId,version:item.version}}));},
  async children(id:string):Promise<RequirementView[]>{return (await unwrap(await client.GET('/api/referentiels/profils-emploi/{id}/exigences',{params:{path:{id}}}))).map(({id,competencyId,competencyLabel,classificationId,classificationLabel,version})=>({id,competencyId,competencyLabel,classificationId,classificationLabel,version}));},
};
