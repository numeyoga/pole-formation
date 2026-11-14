import createClient from 'openapi-fetch';
import type {paths,components} from '../../../shared/http/collaborators-generated';
import type {CollaboratorView,CollaboratorFields,CollaboratorPage,CollaboratorSessions} from '../presentation/models';
import {ApiError,csrfHeaders} from '../../../shared/http/session';
import {messages,states,collaboratorMessages as m} from '../../../shared/i18n/fr';
const client=createClient<paths>({credentials:'same-origin'});
export class CollaboratorError extends ApiError{constructor(status:number,message:string,public fields:Record<string,string>={}){super(status,message);}}
export function collaboratorView(dto:components['schemas']['Collaborator']):CollaboratorView{
 return {...dto,label:dto.firstName+' '+dto.lastName,status:dto.active?m.active:m.inactive};
}
async function unwrap<T>(result:{data?:T;error?:unknown;response:Response}):Promise<T>{
 if(!result.response.ok){const problem=result.error as {detail?:string;fieldErrors?:Record<string,string>}|undefined;throw new CollaboratorError(result.response.status,result.response.status===403?messages.forbidden:result.response.status===401?messages.expired:problem?.detail??messages.network,problem?.fieldErrors??{});}
 return result.data as T;
}
export const collaboratorsApi={
 async list(q='',activeOnly=false,page=0):Promise<CollaboratorPage>{const result=await unwrap(await client.GET('/api/collaborateurs',{params:{query:{q,activeOnly,page,size:10}}}));return {...result,items:result.items.map(collaboratorView)};},
 async get(id:string){return collaboratorView(await unwrap(await client.GET('/api/collaborateurs/{id}',{params:{path:{id}}})));},
 async create(fields:CollaboratorFields){return collaboratorView(await unwrap(await client.POST('/api/collaborateurs',{params:{header:await csrfHeaders()},body:fields})));},
 async update(item:CollaboratorView,fields:CollaboratorFields){await unwrap(await client.PUT('/api/collaborateurs/{id}',{params:{path:{id:item.id},header:await csrfHeaders()},body:{...fields,version:item.version}}));},
 async deactivate(item:CollaboratorView){await unwrap(await client.POST('/api/collaborateurs/{id}/desactivation',{params:{path:{id:item.id},header:await csrfHeaders()},body:{version:item.version}}));},
 async sessions(id:string,page=0):Promise<CollaboratorSessions>{const result=await unwrap(await client.GET('/api/collaborateurs/{id}/participations',{params:{path:{id},query:{page,size:10}}}));return {...result,items:result.items.map(item=>({id:item.id,sessionId:item.sessionId,title:item.title,status:states[item.sessionState],participationStatus:states[item.state]}))};},
};
