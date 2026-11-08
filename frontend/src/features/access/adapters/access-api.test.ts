import { test, expect } from 'vitest';
import { participantView } from './access-api';
test('participant mapping preserves the action identifier and exposes presentation fields only',()=>{
  expect(participantView({id:'participation-1',firstName:'Camille',lastName:'Exemple',professionalId:'EX-1',state:'INSCRITE'})).toEqual({id:'participation-1',name:'Camille Exemple',professionalId:'EX-1',state:'INSCRITE'});
});
