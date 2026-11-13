import {test,expect,vi,beforeEach,afterEach} from 'vitest';
import {sessionView} from './sessions-api';
const dto={id:'s',formationId:'f',title:'Session exemple',state:'BROUILLON' as const,capacity:null,modalities:'Sur site',version:3,slots:[{id:'c',startsAt:'2027-01-10T08:00:00Z',endsAt:'2027-01-10T09:00:00Z'}]};
const NativeRequest=Request;
beforeEach(()=>{vi.resetModules();vi.stubGlobal('Request',class extends NativeRequest{constructor(input:RequestInfo|URL,init?:RequestInit){super(typeof input==='string'?new URL(input,'http://localhost'):input,init);}});});
afterEach(()=>vi.unstubAllGlobals());
test('session mapping preserves version and displays explicit UTC independently of browser timezone',()=>{
 expect(sessionView(dto)).toEqual({id:'s',title:'Session exemple',state:'BROUILLON',status:'Brouillon',capacityLabel:'Sans limite de places',modalities:'Sur site',version:3,slots:[{id:'c',start:'10/01/2027 08:00 UTC',end:'10/01/2027 09:00 UTC',startInput:'2027-01-10T08:00:00.000',endInput:'2027-01-10T09:00:00.000'}]});
});
test('slot submission preserves the selected offset and displayed version, with CSRF protection',async()=>{
 const fetch=vi.fn().mockImplementation((request:Request)=>Promise.resolve(request.url.endsWith('/api/auth/csrf')?Response.json({token:'csrf'}):Response.json({id:'slot',startsAt:'2027-01-10T08:00:00Z',endsAt:'2027-01-10T09:00:00Z'},{status:201})));
 vi.stubGlobal('fetch',fetch);const {sessionsApi}=await import('./sessions-api');
 await sessionsApi.addSlot(sessionView(dto),'2027-01-10T09:00','2027-01-10T10:00','+01:00');
 const request=fetch.mock.calls[1][0] as Request;
 expect(request.headers.get('X-CSRF-TOKEN')).toBe('csrf');expect(await request.json()).toEqual({startsAt:'2027-01-10T09:00+01:00',endsAt:'2027-01-10T10:00+01:00',version:3,confirmConflicts:false});
});
test('capacity field errors are preserved for the creation form',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockImplementation((request:Request)=>Promise.resolve(request.url.endsWith('/api/auth/csrf')?Response.json({token:'csrf'}):Response.json({detail:'Capacité invalide',fieldErrors:{capacity:'Entier positif requis'}},{status:400}))));
 const {sessionsApi}=await import('./sessions-api');await expect(sessionsApi.create('f',{title:'Session',capacity:0,modalities:''})).rejects.toMatchObject({status:400,fields:{capacity:'Entier positif requis'}});
});
test('planning warnings expose conflicts separately from ordinary stale version errors',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockImplementation((request:Request)=>Promise.resolve(request.url.endsWith('/api/auth/csrf')?Response.json({token:'csrf'}):Response.json({detail:'Conflits',confirmationRequired:true,conflictingSessionIds:['other']},{status:409}))));
 const {sessionsApi}=await import('./sessions-api');
 await expect(sessionsApi.addSlot(sessionView(dto),'2027-01-10T09:00','2027-01-10T10:00','Z')).rejects.toMatchObject({status:409,conflicts:['other']});
});
test('slot edits send the displayed version and explicit confirmation to the audited endpoint',async()=>{
 const fetch=vi.fn().mockImplementation((request:Request)=>Promise.resolve(request.url.endsWith('/api/auth/csrf')?Response.json({token:'csrf'}):new Response(null,{status:204})));
 vi.stubGlobal('fetch',fetch);const {sessionsApi}=await import('./sessions-api');await sessionsApi.editSlot(sessionView(dto),'c','2027-01-10T09:00','2027-01-10T10:00','+01:00',true);
 const request=fetch.mock.calls[1][0] as Request;expect(request.method).toBe('PUT');expect(request.url).toBe('http://localhost/api/sessions/s/creneaux/c');expect(request.headers.get('X-CSRF-TOKEN')).toBe('csrf');expect(await request.json()).toEqual({startsAt:'2027-01-10T09:00+01:00',endsAt:'2027-01-10T10:00+01:00',version:3,confirmConflicts:true});
});
