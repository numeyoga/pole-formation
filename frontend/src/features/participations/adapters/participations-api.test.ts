import {test,expect,vi,beforeEach,afterEach} from 'vitest';
const NativeRequest=Request;
beforeEach(()=>{vi.resetModules();vi.stubGlobal('Request',class extends NativeRequest{constructor(input:RequestInfo|URL,init?:RequestInit){super(typeof input==='string'?new URL(input,'http://localhost'):input,init);}});});
afterEach(()=>vi.unstubAllGlobals());
test('registration submits CSRF and explicit conflict confirmation without inferring eligibility',async()=>{
 const fetch=vi.fn().mockImplementation((r:Request)=>Promise.resolve(r.url.endsWith('/api/auth/csrf')?Response.json({token:'csrf'}):Response.json({id:'p'},{status:201})));vi.stubGlobal('fetch',fetch);
 const {participationsApi}=await import('./participations-api');expect(await participationsApi.enroll('s','c',true)).toEqual({id:'p'});const r=fetch.mock.calls[1][0] as Request;expect(r.headers.get('X-CSRF-TOKEN')).toBe('csrf');expect(await r.json()).toEqual({collaboratorId:'c',confirmConflicts:true});
});
test('planning conflicts expose confirmation separately from a capacity rejection',async()=>{
 const fetch=vi.fn().mockImplementation((r:Request)=>Promise.resolve(r.url.endsWith('/api/auth/csrf')?Response.json({token:'csrf'}):Response.json({detail:'Conflits',confirmationRequired:true,conflictingSessionIds:['other']},{status:409})));vi.stubGlobal('fetch',fetch);
 const {participationsApi}=await import('./participations-api');await expect(participationsApi.transition('s','p','INSCRITE')).rejects.toMatchObject({status:409,conflicts:['other']});
});
