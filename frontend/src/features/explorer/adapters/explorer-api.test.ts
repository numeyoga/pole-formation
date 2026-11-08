import {test,expect} from 'vitest';
import {referenceNode,searchMatch} from './explorer-api';

test('exploration maps every historical level with its own status and identity',()=>{
  const domain={id:'domain',code:'DOM',label:'Domaine historique',active:false};
  const subdomain={id:'sub',code:'SUB',label:'Sous-domaine',active:true};
  const competency={id:'comp',code:'COMP',label:'Compétence historique',active:false};
  expect(referenceNode(domain)).toEqual({id:'domain',code:'DOM',label:'Domaine historique',status:'Désactivé'});
  expect(searchMatch({domain,subdomain,competency})).toEqual({id:'comp',code:'COMP',label:'Compétence historique',status:'Désactivé',path:'DOM — Domaine historique (Désactivé) → SUB — Sous-domaine (Actif) → COMP — Compétence historique (Désactivé)'});
});
