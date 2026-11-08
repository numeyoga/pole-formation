import { test,expect } from 'vitest';
import { competencyView } from './competencies-api';
test('competency mapping preserves parent identity and explicitly presents its status',()=>{
  const dto={id:'child',subdomainId:'parent',code:'PREV',label:'Prévention',active:false,version:4,subdomainCode:'SEC',subdomainLabel:'Sécurité',subdomainActive:false};
  expect(competencyView(dto)).toEqual({id:'child',subdomainId:'parent',code:'PREV',label:'Prévention',active:false,version:4,status:'Désactivé',parentCode:'SEC',parentLabel:'Sécurité',parentStatus:'Désactivé'});
  expect(competencyView({...dto,subdomainActive:true}).parentStatus).toBe('Actif');
});
