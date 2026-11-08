import { test,expect,type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function login(page:Page,user='gestionnaire'){
  await page.goto('/');await page.getByLabel('Identifiant',{exact:true}).fill(user);await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();await page.getByRole('heading',{name:'Sessions accessibles',exact:true}).waitFor();
}
async function headers(page:Page){const token=await(await page.request.get('/api/auth/csrf')).json();return {[token.headerName]:token.token};}
const code=()=>`000-DOM-${9999999999999-Date.now()}`;

test('manager creates, edits and deactivates a domain while preserving its children',async({page})=>{
  await login(page);
  await page.getByRole('button',{name:'Domaines',exact:true}).focus();await page.keyboard.press('Enter');
  await expect(page.getByRole('heading',{name:'Domaines de compétences',exact:true})).toBeFocused();
  const panel=page.getByRole('region',{name:'Domaines de compétences',exact:true});
  await panel.getByRole('button',{name:'Créer un domaine',exact:true}).click();
  const editor=page.getByRole('dialog',{name:'Créer un domaine',exact:true});
  await expect(editor.getByLabel('Code',{exact:true})).toBeFocused();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  const initialCode=code();const label=`Domaine recette ${initialCode}`;
  await editor.getByLabel('Code',{exact:true}).fill(initialCode);await editor.getByLabel('Libellé',{exact:true}).fill(label);
  const response=page.waitForResponse(r=>r.request().method()==='POST'&&r.url().endsWith('/api/referentiels/domaines'));
  await editor.getByRole('button',{name:'Enregistrer le domaine',exact:true}).click();const created=await(await response).json();
  await expect(panel.getByRole('status',{name:'État des domaines'})).toHaveText('Domaine enregistré.');
  await expect(page.getByRole('heading',{name:'Domaines de compétences',exact:true})).toBeFocused();
  await panel.getByRole('button',{name:'Créer un domaine',exact:true}).click();
  await editor.getByLabel('Code',{exact:true}).fill(initialCode.toLowerCase());await editor.getByLabel('Libellé',{exact:true}).fill('Doublon');
  await editor.getByRole('button',{name:'Enregistrer le domaine',exact:true}).click();
  await expect(editor.getByRole('alert')).toContainText('déjà utilisé');await expect(editor.getByRole('alert')).toBeFocused();
  await expect(editor.getByLabel('Code',{exact:true})).toHaveAttribute('aria-invalid','true');
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');await expect(panel.getByRole('button',{name:'Créer un domaine',exact:true})).toBeFocused();
  await panel.getByRole('button',{name:`Modifier ${label}`,exact:true}).click();
  const editing=page.getByRole('dialog',{name:'Modifier un domaine',exact:true});
  await expect(editing.getByLabel('Code',{exact:true})).toHaveValue(initialCode);
  await editing.getByLabel('Code',{exact:true}).fill(initialCode+'-B');await editing.getByLabel('Libellé',{exact:true}).fill(label+' modifié');
  await editing.getByRole('button',{name:'Enregistrer le domaine',exact:true}).click();
  await expect(panel.getByRole('status',{name:'État des domaines'})).toHaveText('Domaine enregistré.');
  const child=await page.request.post(`/api/referentiels/domaines/${created.id}/sous-domaines`,{headers:await headers(page),data:{label:'Sous-domaine historique de recette'}});expect(child.status()).toBe(201);
  const row=panel.getByRole('row').filter({hasText:initialCode+'-B'});
  await row.getByText(`Sous-domaines de ${label} modifié`,{exact:true}).click();
  await expect(row.getByText('Sous-domaine historique de recette',{exact:true})).toBeVisible();
  const disable=row.getByRole('button',{name:`Désactiver ${label} modifié`,exact:true});await disable.click();
  const confirmation=page.getByRole('dialog',{name:'Désactiver un domaine',exact:true});
  await expect(confirmation.getByRole('button',{name:'Annuler',exact:true})).toBeFocused();await page.keyboard.press('Escape');await expect(disable).toBeFocused();
  await disable.click();await confirmation.getByRole('button',{name:'Confirmer la désactivation',exact:true}).click();
  await expect(panel.getByRole('status',{name:'État des domaines'})).toContainText('Domaine désactivé.');
  await expect(row.getByRole('cell',{name:'Désactivé',exact:true})).toBeVisible();
  await row.getByText(`Sous-domaines de ${label} modifié`,{exact:true}).click();await expect(row.getByText('Sous-domaine historique de recette',{exact:true})).toBeVisible();
  expect((await page.request.post(`/api/referentiels/domaines/${created.id}/sous-domaines`,{headers:await headers(page),data:{label:'Interdit'}})).status()).toBe(409);
  await page.setViewportSize({width:375,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const table=panel.getByRole('region',{name:'Tableau des domaines',exact:true});await table.focus();await page.keyboard.press('ArrowRight');
  await expect.poll(()=>table.evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});

test('stale edit is rejected and can reload the current version',async({page})=>{
  await login(page);const initialCode=code();const label=`Concurrence ${initialCode}`;
  const response=await page.request.post('/api/referentiels/domaines',{headers:await headers(page),data:{code:initialCode,label}});expect(response.status()).toBe(201);const created=await response.json();
  const panel=page.getByRole('region',{name:'Domaines de compétences',exact:true});await panel.getByRole('button',{name:'Actualiser les domaines',exact:true}).click();
  await panel.getByRole('button',{name:`Modifier ${label}`,exact:true}).click();const editor=page.getByRole('dialog',{name:'Modifier un domaine',exact:true});
  expect((await page.request.put(`/api/referentiels/domaines/${created.id}`,{headers:await headers(page),data:{code:initialCode,label:'Modifié par un autre gestionnaire',version:created.version}})).status()).toBe(204);
  await editor.getByLabel('Libellé',{exact:true}).fill('Modification locale');await editor.getByRole('button',{name:'Enregistrer le domaine',exact:true}).click();
  await expect(editor.getByRole('alert')).toContainText('a été modifié');await expect(editor.getByRole('alert')).toBeFocused();
  await editor.getByRole('button',{name:'Recharger la fiche',exact:true}).click();await expect(editor.getByLabel('Libellé',{exact:true})).toHaveValue('Modifié par un autre gestionnaire');
  await editor.getByLabel('Libellé',{exact:true}).fill('Modification après rechargement');await editor.getByRole('button',{name:'Enregistrer le domaine',exact:true}).click();
  await expect(panel.getByRole('status',{name:'État des domaines'})).toHaveText('Domaine enregistré.');
});

test('instructor cannot manage domains or see their management section',async({page})=>{
  await login(page,'intervenant');await expect(page.getByRole('heading',{name:'Domaines de compétences',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Domaines',exact:true})).toHaveCount(0);expect((await page.request.get('/api/referentiels/domaines')).status()).toBe(403);
});

test('domain pagination and network retry keep the list usable',async({page})=>{
  await page.route('**/api/referentiels/domaines?*',route=>route.abort());
  await login(page);const panel=page.getByRole('region',{name:'Domaines de compétences',exact:true});
  await expect(panel.getByRole('alert')).toHaveText('Le service est indisponible. Réessayez.');
  await page.unroute('**/api/referentiels/domaines?*');
  const token=await headers(page);const prefix=`PAGE-${Date.now()}`;
  for(let index=0;index<11;index++)expect((await page.request.post('/api/referentiels/domaines',{headers:token,data:{code:`${prefix}-${index}`,label:`Pagination ${index}`}})).status()).toBe(201);
  await panel.getByRole('button',{name:'Actualiser les domaines',exact:true}).click();
  await expect(panel.getByRole('alert')).toHaveCount(0);await expect(panel.getByRole('row')).toHaveCount(11);
  const first=await panel.getByRole('row').nth(1).textContent();
  await panel.getByRole('button',{name:'Domaines suivants',exact:true}).click();
  await expect(panel.getByText('Page 2',{exact:true})).toBeVisible();expect(await panel.getByRole('row').nth(1).textContent()).not.toBe(first);
  await panel.getByRole('button',{name:'Domaines précédents',exact:true}).click();await expect(panel.getByText('Page 1',{exact:true})).toBeVisible();
});
