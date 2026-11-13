import {test,expect,vi,beforeEach,afterEach} from 'vitest';
import {instructorView} from './instructors-api';
const dto={id:'i',label:'Ancien libellé',firstName:null,lastName:null,professionalContact:'',active:false,version:4,hasAccount:true,sessionCount:2};
const NativeRequest=Request;
beforeEach(()=>{vi.resetModules();vi.stubGlobal('Request',class extends NativeRequest{constructor(input:RequestInfo|URL,init?:RequestInit){super(typeof input==='string'?new URL(input,'http://localhost'):input,init);}});});
afterEach(()=>vi.unstubAllGlobals());
test('legacy instructor mapping preserves its label and account without inventing structured names',()=>{
 expect(instructorView(dto)).toEqual({...dto,firstName:'',lastName:'',legacy:true,status:'Désactivé',accountLabel:'Compte lié'});
});
test('instructor update transmits the displayed version and CSRF token without account provisioning',async()=>{
 const fetch=vi.fn().mockImplementation((request:Request)=>Promise.resolve(request.url.endsWith('/api/auth/csrf')?Response.json({token:'csrf'}):new Response(null,{status:204})));
 vi.stubGlobal('fetch',fetch);const {instructorsApi}=await import('./instructors-api');await instructorsApi.update(instructorView(dto),{firstName:'Ada',lastName:'Exemple',professionalContact:'Fictif'});
 const request=fetch.mock.calls[1][0] as Request;expect(request.headers.get('X-CSRF-TOKEN')).toBe('csrf');expect(await request.json()).toEqual({firstName:'Ada',lastName:'Exemple',professionalContact:'Fictif',version:4});
});
test('search and active filter are passed to the server before mapping its page',async()=>{
 const fetch=vi.fn().mockResolvedValue(Response.json({items:[dto],page:1,size:10,total:12}));vi.stubGlobal('fetch',fetch);const {instructorsApi}=await import('./instructors-api');
 expect(await instructorsApi.list('Nom_%',true,1)).toEqual({items:[instructorView(dto)],page:1,size:10,total:12});const url=new URL((fetch.mock.calls[0][0] as Request).url);expect(url.searchParams.get('q')).toBe('Nom_%');expect(url.searchParams.get('activeOnly')).toBe('true');expect(url.searchParams.get('page')).toBe('1');
});
test('field validation errors are kept for accessible form feedback',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockImplementation((request:Request)=>Promise.resolve(request.url.endsWith('/api/auth/csrf')?Response.json({token:'csrf'}):Response.json({detail:'Prénom requis',fieldErrors:{firstName:'Prénom requis'}},{status:400}))));
 const {instructorsApi}=await import('./instructors-api');await expect(instructorsApi.create({firstName:'',lastName:'Exemple',professionalContact:''})).rejects.toMatchObject({status:400,fields:{firstName:'Prénom requis'}});
});
