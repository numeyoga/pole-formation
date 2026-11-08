import createClient from 'openapi-fetch';
import type { paths, components } from '../../../shared/http/generated';
import type { Identity, SessionView, ParticipantView, AccountView, Role } from '../presentation/models';
import { messages } from '../../../shared/i18n/fr';

export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export function participantView(dto: components['schemas']['Participant']): ParticipantView {
  return {id:dto.id,name:`${dto.firstName} ${dto.lastName}`,professionalId:dto.professionalId,state:dto.state};
}
const client = createClient<paths>({credentials:'same-origin'});
async function unwrap<T>(result: {data?:T; error?:unknown; response:Response}): Promise<T> {
  if (!result.response.ok) {
    const error=result.error as {detail?:string}|undefined;
    throw new ApiError(result.response.status, result.response.status===403 ? messages.forbidden : result.response.status===401 ? messages.expired : error?.detail ?? messages.network);
  }
  return result.data as T;
}
async function csrf(): Promise<{'X-CSRF-TOKEN':string}> {
  const token=await unwrap(await client.GET('/api/auth/csrf'));
  return {'X-CSRF-TOKEN':token.token};
}
export const api = {
  async me():Promise<Identity> { return unwrap(await client.GET('/api/auth/me')); },
  async login(username:string,password:string) {
    const headers=await csrf();
    const result=await client.POST('/api/auth/login',{params:{header:headers},body:{username,password},bodySerializer:body=>new URLSearchParams(body).toString(),headers:{'Content-Type':'application/x-www-form-urlencoded'}});
    if(result.response.status===401) throw new ApiError(401,messages.invalidLogin);
    await unwrap(result);
  },
  async logout() { await unwrap(await client.POST('/api/auth/logout',{params:{header:await csrf()}})); },
  async sessions():Promise<SessionView[]> { const list=await unwrap(await client.GET('/api/sessions'));return list.map(({id,title,state})=>({id,title,state})); },
  async participants(id:string):Promise<ParticipantView[]> { return (await unwrap(await client.GET('/api/sessions/{id}/participants',{params:{path:{id}}}))).map(participantView); },
  async presence(id:string,participationId:string,state:'PRESENTE'|'ABSENTE') {
    await unwrap(await client.PUT('/api/sessions/{id}/participants/{participationId}/presence',{params:{path:{id,participationId},header:await csrf()},body:{state}}));
  },
  async accounts():Promise<AccountView[]> { return unwrap(await client.GET('/api/habilitations/comptes')); },
  async role(username:string,role:Role) { await unwrap(await client.PUT('/api/habilitations/comptes/{username}/role',{params:{path:{username},header:await csrf()},body:{role}})); },
};
