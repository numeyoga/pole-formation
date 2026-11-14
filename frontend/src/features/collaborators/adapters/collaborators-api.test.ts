import {test,expect,vi,beforeEach,afterEach} from 'vitest';
import {collaboratorView} from './collaborators-api';
const NativeRequest=Request;
beforeEach(()=>{vi.resetModules();vi.stubGlobal('Request',class extends NativeRequest{constructor(input:RequestInfo|URL,init?:RequestInit){super(typeof input==='string'?new URL(input,'http://localhost'):input,init);}});});
afterEach(()=>vi.unstubAllGlobals());
test('inactive collaborator retains the professional identity without a profile mapping',()=>{
 expect(collaboratorView({id:'one',professionalId:'E-001',firstName:'Ada',lastName:'Exemple',active:false,version:4})).toEqual({id:'one',professionalId:'E-001',firstName:'Ada',lastName:'Exemple',active:false,version:4,label:'Ada Exemple',status:'Désactivé'});
});
test('history retains participation identity and separates session cancellation from attendance',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({items:[{id:'p',sessionId:'s',title:'Session',sessionState:'ANNULEE',state:'ABSENTE'}],total:1,page:0,size:10})));
 const {collaboratorsApi}=await import('./collaborators-api');expect(await collaboratorsApi.sessions('one')).toEqual({items:[{id:'p',sessionId:'s',title:'Session',status:'Annulée',participationStatus:'Absente'}],total:1,page:0,size:10});
});
