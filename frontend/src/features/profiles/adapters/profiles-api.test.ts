import { test,expect,vi,afterEach,beforeEach } from 'vitest';
import { profileView } from './profiles-api';
const dto={id:'profile-1',code:'P01',label:'Technicien',description:'Description',active:false,version:3};
const NativeRequest=Request;
beforeEach(()=>{
  vi.resetModules();
  vi.stubGlobal('Request',class extends NativeRequest {
    constructor(input:RequestInfo|URL,init?:RequestInit){super(typeof input==='string'?new URL(input,'http://localhost'):input,init);}
  });
});
afterEach(()=>vi.unstubAllGlobals());
test('mapping preserves profile identity, description, version and inactive status',()=>{
  expect(profileView(dto)).toEqual({...dto,status:'Désactivé'});
});
test('list maps the HTTP contract and retains pagination',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({items:[dto],total:11,page:1,size:10})));
  const {profilesApi}=await import('./profiles-api');
  expect(await profilesApi.list(1)).toEqual({items:[{...dto,status:'Désactivé'}],total:11,page:1,size:10});
});
test('field conflicts remain actionable for the form',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({detail:'Code déjà utilisé',fieldErrors:{code:'Code déjà utilisé'}},{status:409})));
  const {profilesApi}=await import('./profiles-api');
  await expect(profilesApi.get('profile-1')).rejects.toMatchObject({status:409,fields:{code:'Code déjà utilisé'}});
});
test('expired sessions are presented explicitly',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockImplementation(()=>Promise.resolve(Response.json({},{status:401}))));
  const {profilesApi,ProfileError}=await import('./profiles-api');
  await expect(profilesApi.list()).rejects.toBeInstanceOf(ProfileError);
  await expect(profilesApi.list()).rejects.toThrow('Votre session a expiré. Connectez-vous à nouveau.');
});
test('requirements retain reference ids and concurrency version',async()=>{
  const item={id:'r',profileId:'p',competencyId:'c',competencyLabel:'Compétence',classificationId:'k',classificationLabel:'Classification historique',version:7};
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json([item])));
  const {profilesApi}=await import('./profiles-api');
  expect(await profilesApi.children('p')).toEqual([{id:'r',competencyId:'c',competencyLabel:'Compétence',classificationId:'k',classificationLabel:'Classification historique',version:7}]);
});
test('available choices preserve pagination and request active classifications',async()=>{
  const fetch=vi.fn().mockImplementation(()=>Promise.resolve(Response.json({items:[{id:'c',code:'C1',label:'Compétence'}],total:15,page:1,size:10})));
  vi.stubGlobal('fetch',fetch);const {profilesApi}=await import('./profiles-api');
  expect(await profilesApi.competencyChoices('C1',1)).toEqual({items:[{id:'c',label:'C1 — Compétence'}],total:15,page:1,size:10});
  expect(new URL(fetch.mock.calls[0][0].url).searchParams.get('q')).toBe('C1');
  await profilesApi.classificationChoices(1);
  expect(new URL(fetch.mock.calls[1][0].url).searchParams.get('activeOnly')).toBe('true');
});
test('reclassification sends the observed version and CSRF token',async()=>{
  const fetch=vi.fn().mockImplementation((request:Request)=>Promise.resolve(request.url.endsWith('/api/auth/csrf')?Response.json({headerName:'X-CSRF-TOKEN',token:'csrf'}):new Response(null,{status:204})));
  vi.stubGlobal('fetch',fetch);const {profilesApi}=await import('./profiles-api');
  await profilesApi.reclassify('p',{id:'r',competencyId:'c',competencyLabel:'C',classificationId:'old',classificationLabel:'Old',version:7},'new');
  const request:Request=fetch.mock.calls[1][0];expect(request.method).toBe('PUT');expect(request.headers.get('X-CSRF-TOKEN')).toBe('csrf');
  expect(await request.json()).toEqual({classificationId:'new',version:7});
});
