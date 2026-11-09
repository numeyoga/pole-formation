import { test,expect,vi,beforeEach,afterEach } from 'vitest';
import { formationView } from './formations-api';
const dto={id:'f',code:'FOR',title:'Formation exemple',objectives:'Objectifs',description:'Description',durationMinutes:90,state:'ARCHIVEE' as const,version:4};
const NativeRequest=Request;
beforeEach(()=>{vi.resetModules();vi.stubGlobal('Request',class extends NativeRequest {constructor(input:RequestInfo|URL,init?:RequestInit){super(typeof input==='string'?new URL(input,'http://localhost'):input,init);}});});
afterEach(()=>vi.unstubAllGlobals());
test('formation mapping preserves archived history, fields, duration and version',()=>{expect(formationView(dto)).toEqual({...dto,status:'Archivée'});});
test('catalogue maps the HTTP page and nullable duration',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockImplementation(()=>Promise.resolve(Response.json({items:[{...dto,durationMinutes:null}],page:1,size:10,total:11}))));
 const {formationsApi}=await import('./formations-api');expect(await formationsApi.list(1)).toEqual({items:[{...dto,durationMinutes:null,status:'Archivée'}],page:1,size:10,total:11});
});
test('reactivation sends the displayed version and CSRF token',async()=>{
 const fetch=vi.fn().mockImplementation((request:Request)=>Promise.resolve(request.url.endsWith('/api/auth/csrf')?Response.json({headerName:'X-CSRF-TOKEN',token:'csrf'}):new Response(null,{status:204})));
 vi.stubGlobal('fetch',fetch);const {formationsApi}=await import('./formations-api');await formationsApi.transition({...dto,status:'Archivée'},'reactivation');
 const request:Request=fetch.mock.calls[1][0];expect(request.url).toBe('http://localhost/api/formations/f/reactivation');expect(request.headers.get('X-CSRF-TOKEN')).toBe('csrf');expect(await request.json()).toEqual({version:4});
});
test('field conflicts and expired sessions remain actionable',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(Response.json({detail:'Code réservé',fieldErrors:{code:'Code réservé'}},{status:409})).mockResolvedValueOnce(Response.json({},{status:401})));
 const {formationsApi}=await import('./formations-api');await expect(formationsApi.get('f')).rejects.toMatchObject({status:409,fields:{code:'Code réservé'}});
 await expect(formationsApi.list()).rejects.toThrow('Votre session a expiré. Connectez-vous à nouveau.');
});
