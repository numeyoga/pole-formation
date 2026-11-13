import createClient from 'openapi-fetch';
import type {paths,components} from '../../../shared/http/instructors-generated';
import type {InstructorView,InstructorFields,InstructorPage,InstructorSessions} from '../presentation/models';
import {ApiError,csrfHeaders} from '../../../shared/http/session';
import {messages,states,instructorMessages as m} from '../../../shared/i18n/fr';
const client=createClient<paths>({credentials:'same-origin'});
export class InstructorError extends ApiError{constructor(status:number,message:string,public fields:Record<string,string>={}){super(status,message);}}
export function instructorView(dto:components['schemas']['Instructor']):InstructorView{
 return {...dto,firstName:dto.firstName??'',lastName:dto.lastName??'',legacy:dto.firstName===null||dto.lastName===null,status:dto.active?m.active:m.inactive,accountLabel:dto.hasAccount?m.linked:m.unlinked};
}
async function unwrap<T>(result:{data?:T;error?:unknown;response:Response}):Promise<T>{
 if(!result.response.ok){const problem=result.error as {detail?:string;fieldErrors?:Record<string,string>}|undefined;throw new InstructorError(result.response.status,result.response.status===403?messages.forbidden:result.response.status===401?messages.expired:problem?.detail??messages.network,problem?.fieldErrors??{});}
 return result.data as T;
}
export const instructorsApi={
 async list(q='',activeOnly=false,page=0):Promise<InstructorPage>{const result=await unwrap(await client.GET('/api/intervenants',{params:{query:{q,activeOnly,page,size:10}}}));return {...result,items:result.items.map(instructorView)};},
 async get(id:string){return instructorView(await unwrap(await client.GET('/api/intervenants/{id}',{params:{path:{id}}})));},
 async create(fields:InstructorFields){return instructorView(await unwrap(await client.POST('/api/intervenants',{params:{header:await csrfHeaders()},body:fields})));},
 async update(item:InstructorView,fields:InstructorFields){await unwrap(await client.PUT('/api/intervenants/{id}',{params:{path:{id:item.id},header:await csrfHeaders()},body:{...fields,version:item.version}}));},
 async deactivate(item:InstructorView){await unwrap(await client.POST('/api/intervenants/{id}/desactivation',{params:{path:{id:item.id},header:await csrfHeaders()},body:{version:item.version}}));},
 async sessions(id:string,page=0):Promise<InstructorSessions>{const result=await unwrap(await client.GET('/api/intervenants/{id}/sessions',{params:{path:{id},query:{page,size:10}}}));return {...result,items:result.items.map(item=>({id:item.id,title:item.title,status:states[item.state]}))};},
};
