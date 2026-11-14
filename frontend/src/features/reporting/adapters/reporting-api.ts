import createClient from 'openapi-fetch';
import type {paths} from '../../../shared/http/activity-generated';
import type {Filters,Overview,ActivityPage} from '../presentation/models';
import {ApiError} from '../../../shared/http/session';
import {messages,states,reportingMessages as m} from '../../../shared/i18n/fr';
const client=createClient<paths>({credentials:'same-origin'});
async function unwrap<T>(result:{data?:T;error?:unknown;response:Response}):Promise<T>{if(!result.response.ok){const error=result.error as {detail?:string}|undefined;throw new ApiError(result.response.status,result.response.status===403?messages.forbidden:result.response.status===401?messages.expired:error?.detail??messages.network);}return result.data as T;}
const formatter=new Intl.DateTimeFormat('fr-FR',{dateStyle:'short',timeStyle:'short',timeZone:'UTC'});
export const reportingApi={
 async overview(filters:Filters):Promise<Overview>{return unwrap(await client.GET('/api/pilotage',{params:{query:filters}}));},
 async sessions(filters:Filters,page=0):Promise<ActivityPage>{const data=await unwrap(await client.GET('/api/pilotage/sessions',{params:{query:{...filters,page,size:10}}}));return {...data,items:data.items.map(i=>({id:i.id,title:i.title,status:states[i.state],firstSlot:i.firstSlotStart?formatter.format(new Date(i.firstSlotStart))+' UTC':m.noSlot,counts:i.participations}))};},
};
