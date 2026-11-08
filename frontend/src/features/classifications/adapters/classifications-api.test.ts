import { test,expect,vi,afterEach,beforeEach } from 'vitest';
import { classificationView } from './classifications-api';
const dto={id:'classification-1',code:'P01',label:'Technicien',sortOrder:4,active:false,version:3};
const NativeRequest=Request;
beforeEach(()=>{
  vi.resetModules();
  vi.stubGlobal('Request',class extends NativeRequest {
    constructor(input:RequestInfo|URL,init?:RequestInit){super(typeof input==='string'?new URL(input,'http://localhost'):input,init);}
  });
});
afterEach(()=>vi.unstubAllGlobals());
test('mapping preserves classification identity, sort order, version and inactive status',()=>{
  expect(classificationView(dto)).toEqual({...dto,status:'Désactivé'});
});
test('list maps the HTTP contract and retains pagination',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({items:[dto],total:11,page:1,size:10})));
  const {classificationsApi}=await import('./classifications-api');
  expect(await classificationsApi.list(1)).toEqual({items:[{...dto,status:'Désactivé'}],total:11,page:1,size:10});
});
test('field conflicts remain actionable for the form',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({detail:'Code déjà utilisé',fieldErrors:{code:'Code déjà utilisé'}},{status:409})));
  const {classificationsApi}=await import('./classifications-api');
  await expect(classificationsApi.get('classification-1')).rejects.toMatchObject({status:409,fields:{code:'Code déjà utilisé'}});
});
test('expired sessions are presented explicitly',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockImplementation(()=>Promise.resolve(Response.json({},{status:401}))));
  const {classificationsApi,ClassificationError}=await import('./classifications-api');
  await expect(classificationsApi.list()).rejects.toBeInstanceOf(ClassificationError);
  await expect(classificationsApi.list()).rejects.toThrow('Votre session a expiré. Connectez-vous à nouveau.');
});
