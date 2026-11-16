import {describe,it,expect} from 'vitest';
import {resolvePage,canOpenPage,navigationItems,referenceItems} from './navigation';

describe('Application pages',()=>{
  it('opens sessions on arrival and recognizes every shared page address',()=>{
    expect(resolvePage({pathname:'/'} as Location)?.id).toBe('sessions');
    for(const page of [...navigationItems,...referenceItems]) {
      expect(resolvePage({pathname:page.path} as Location)?.id).toBe(page.id);
    }
    expect(resolvePage({pathname:'/absent'} as Location)).toBeNull();
    expect(resolvePage({pathname:'/api/sessions'} as Location)).toBeNull();
    expect(resolvePage({pathname:'/referentiel/domaines/autre'} as Location)).toBeNull();
  });
  it('recognizes autonomous records and only their declared sections',()=>{
    const entityId='50000000-0000-0000-0000-000000000001';
    const sections:Record<string,string[]>={catalogue:['presentation','competences','sessions'],profils:['presentation','exigences','formations'],collaborateurs:['informations','participations']};
    for(const [id,items] of Object.entries(sections)){
      const root=resolvePage({pathname:`/${id}/${entityId}`} as Location);
      expect(root).toMatchObject({id,entityId,section:items[0]});
      for(const section of items){
        const page=resolvePage({pathname:`/${id}/${entityId}/${section}`} as Location);
        expect(page).toMatchObject({id,entityId,section});
        expect(canOpenPage(page!,[])).toBe(false);
      }
      expect(resolvePage({pathname:`/${id}/invalid/${items[0]}`} as Location)).toBeNull();
      expect(resolvePage({pathname:`/${id}/${entityId}/inconnue`} as Location)).toBeNull();
      expect(resolvePage({pathname:`/${id}/${entityId}/${items[0]}/extra`} as Location)).toBeNull();
    }
  });
  it('keeps pages unavailable until the corresponding permission is present',()=>{
    for(const page of [...navigationItems,...referenceItems]) {
      expect(canOpenPage(page,[])).toBe(!page.permission);
      if(page.permission)expect(canOpenPage(page,[page.permission])).toBe(true);
      expect(canOpenPage(page,['UNRELATED'])).toBe(!page.permission);
    }
  });
});
