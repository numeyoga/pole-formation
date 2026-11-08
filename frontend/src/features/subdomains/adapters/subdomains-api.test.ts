import { test,expect } from 'vitest';
import { subdomainView } from './subdomains-api';
test('subdomain mapping preserves parent identity and explicitly presents its status',()=>{
  const dto={id:'child',domainId:'parent',code:'PREV',label:'Prévention',active:false,version:4,domainCode:'SEC',domainLabel:'Sécurité',domainActive:false};
  expect(subdomainView(dto)).toEqual({id:'child',domainId:'parent',code:'PREV',label:'Prévention',active:false,version:4,status:'Désactivé',parentCode:'SEC',parentLabel:'Sécurité',parentStatus:'Désactivé'});
  expect(subdomainView({...dto,domainActive:true}).parentStatus).toBe('Actif');
});
