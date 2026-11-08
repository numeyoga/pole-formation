import createClient from 'openapi-fetch';
import type { paths } from './generated';
import { messages } from '../i18n/fr';

export class ApiError extends Error {constructor(public status:number,message:string){super(message);}}
const client=createClient<paths>({credentials:'same-origin'});
export async function csrfHeaders():Promise<{'X-CSRF-TOKEN':string}>{
  const result=await client.GET('/api/auth/csrf');
  if(!result.response.ok || !result.data)throw new ApiError(result.response.status,messages.network);
  return {'X-CSRF-TOKEN':result.data.token};
}
