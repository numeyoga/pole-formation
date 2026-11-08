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
