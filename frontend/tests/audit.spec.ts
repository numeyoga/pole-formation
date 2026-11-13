import { test,expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('administrator can inspect a real correction, filter the journal and navigate it by keyboard',async({page})=>{
  await page.goto('/');
  await page.getByLabel('Identifiant',{exact:true}).fill('admin');await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();
  await page.getByRole('heading',{name:'Sessions accessibles',exact:true}).waitFor();
  const session='20000000-0000-0000-0000-000000000003';
  const participant='40000000-0000-0000-0000-000000000003';
  const previous=(await (await page.request.get(`/api/sessions/${session}/participants`)).json()).find((item:{id:string;state:string})=>item.id===participant).state;
  await page.getByRole('button',{name:'Exemple — Session clôturée',exact:true}).click();
  await page.getByRole('button',{name:previous==='PRESENTE'?'Marquer Camille Exemple absente':'Marquer Camille Exemple présente',exact:true}).click();
  await expect(page.getByRole('status',{name:'État de l’opération'})).toHaveText('Modification enregistrée.');
  const journal=page.getByRole('region',{name:'Journal des changements sensibles',exact:true});
  await journal.getByLabel('Type d’objet',{exact:true}).selectOption('PARTICIPATION');
  await journal.getByLabel('Session',{exact:true}).selectOption(session);
  await journal.getByLabel('Identifiant de l’objet (facultatif)',{exact:true}).fill(participant);
  const filter=journal.getByRole('button',{name:'Filtrer le journal',exact:true});
  await filter.focus();await page.keyboard.press('Enter');
  await expect(journal.getByRole('status',{name:'État du journal'})).toBeFocused();
  await expect(journal.getByRole('heading',{name:'Correction de présence après clôture',exact:true}).first()).toBeVisible();
  await expect(journal.getByText('Auteur : admin',{exact:false}).first()).toBeVisible();
  await expect(journal.getByText('État : Présente',{exact:true}).first()).toBeVisible();
  await expect(journal.getByText('État : Absente',{exact:true}).first()).toBeVisible();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await journal.getByLabel('Identifiant de l’objet (facultatif)',{exact:true}).fill('aucune-cible');
  await filter.click();await expect(journal.getByText('Aucun changement sensible pour ces filtres.',{exact:true})).toBeVisible();
  await page.setViewportSize({width:375,height:812});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.getByRole('button',{name:'Se déconnecter',exact:true}).click();
  await expect(journal).toHaveCount(0);
});

test('instructor has no journal view and cannot access the journal API',async({page})=>{
  await page.goto('/');await page.getByLabel('Identifiant',{exact:true}).fill('intervenant');await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();
  await page.getByRole('heading',{name:'Sessions accessibles',exact:true}).waitFor();
  await expect(page.getByRole('region',{name:'Journal des changements sensibles',exact:true})).toHaveCount(0);
  expect((await page.request.get('/api/audit')).status()).toBe(403);
});

test('journal recovers from a network error and paginates without repeating events',async({page})=>{
  await page.route('**/api/audit*',route=>route.abort());
  await page.goto('/');await page.getByLabel('Identifiant',{exact:true}).fill('admin');await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();
  const journal=page.getByRole('region',{name:'Journal des changements sensibles',exact:true});
  await expect(journal.getByRole('alert')).toHaveText('Le service est indisponible. Réessayez.');
  await expect(journal.getByRole('alert')).toBeFocused();
  await page.unroute('**/api/audit*');
  await journal.getByRole('button',{name:'Réessayer le journal',exact:true}).click();
  await expect(journal.getByRole('alert')).toHaveCount(0);
  for(let index=0;index<12;index++){
    const token=await (await page.request.get('/api/auth/csrf')).json();
    const response=await page.request.put('/api/habilitations/comptes/sans-affectation/role',{headers:{[token.headerName]:token.token},data:{role:index%2===0?'GESTIONNAIRE':'INTERVENANT'}});
    expect(response.status()).toBe(204);
  }
  await journal.getByLabel('Type d’objet',{exact:true}).selectOption('COMPTE');
  await journal.getByLabel('Identifiant de l’objet (facultatif)',{exact:true}).fill('sans-affectation');
  await journal.getByRole('button',{name:'Filtrer le journal',exact:true}).click();
  await expect(journal.getByRole('article')).toHaveCount(10);
  await journal.getByRole('button',{name:'Afficher les événements précédents',exact:true}).click();
  await expect(journal.getByRole('status',{name:'État du journal'})).toBeFocused();
  const ids=await journal.getByRole('article').evaluateAll(elements=>elements.map(element=>element.getAttribute('aria-labelledby')));
  expect(ids.length).toBeGreaterThanOrEqual(12);expect(new Set(ids).size).toBe(ids.length);
});
