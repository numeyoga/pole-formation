import { test,expect } from 'vitest';
import { domainView } from './domains-api';
test('domain mapping preserves identity and version and presents deactivation explicitly',()=>{
  expect(domainView({id:'domain-1',code:'D01',label:'Sécurité',active:false,version:3})).toEqual({id:'domain-1',code:'D01',label:'Sécurité',active:false,version:3,status:'Désactivé'});
});
