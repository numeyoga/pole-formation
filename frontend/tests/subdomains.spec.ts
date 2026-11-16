import { test,expect,type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function login(page:Page,user='gestionnaire'){
  await page.goto('/');await page.getByLabel('Identifiant',{exact:true}).fill(user);await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();await page.getByRole('heading',{name:'Sessions',level:1,exact:true}).waitFor();if(user!=="intervenant")await page.goto('/referentiel/sous-domaines');
}
test('subdomain catalog supports retry, pagination and keyboard navigation with inactive parents',async({page})=>{
  await page.route('**/api/referentiels/sous-domaines?*',route=>route.abort());
  await login(page);
  const panel=page.getByRole('region',{name:'Sous-domaines de compétences',exact:true});
  await expect(panel.getByRole('alert')).toHaveText('Le service est indisponible. Réessayez.');
  await page.unroute('**/api/referentiels/sous-domaines?*');
  const csrf=await(await page.request.get('/api/auth/csrf')).json();const headers={[csrf.headerName]:csrf.token};
  const prefix=`000-SUB-${9999999999999-Date.now()}`;
  const response=await page.request.post('/api/referentiels/domaines',{headers,data:{code:prefix,label:'Parent historique du catalogue'}});
  expect(response.status()).toBe(201);const parent=await response.json();
  for(let index=0;index<11;index++)expect((await page.request.post(`/api/referentiels/domaines/${parent.id}/sous-domaines`,{headers,data:{label:`${prefix}-${String(index).padStart(2,'0')}`}})).status()).toBe(201);
  expect((await page.request.post(`/api/referentiels/domaines/${parent.id}/desactivation`,{headers,data:{version:parent.version}})).status()).toBe(204);
  await panel.getByRole('button',{name:'Actualiser les sous-domaines',exact:true}).click();
  await expect(panel.getByRole('alert')).toHaveCount(0);await expect(panel.getByRole('row')).toHaveCount(11);
  const row=panel.getByRole('row').nth(1);await expect(row).toContainText(`${prefix}-00`);await expect(row.getByRole('cell',{name:'Désactivé',exact:true})).toBeVisible();
  await page.getByRole('link',{name:'Sous-domaines',exact:true}).focus();await page.keyboard.press('Enter');
  await expect(panel.getByRole('heading',{name:'Sous-domaines de compétences',exact:true})).toBeFocused();
  await panel.getByRole('button',{name:'Sous-domaines suivants',exact:true}).click();await expect(panel.getByText('Page 2',{exact:true})).toBeVisible();
  await expect(panel.getByRole('row').nth(1)).toContainText(`${prefix}-10`);
  await panel.getByRole('button',{name:'Sous-domaines précédents',exact:true}).click();await expect(panel.getByRole('row').nth(1)).toContainText(`${prefix}-00`);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await panel.screenshot({path:'test-results/subdomains-desktop.png'});
  await page.setViewportSize({width:375,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const table=panel.getByRole('region',{name:'Tableau des sous-domaines',exact:true});await table.focus();await page.keyboard.press('ArrowRight');
  await expect.poll(()=>table.evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await panel.screenshot({path:'test-results/subdomains-mobile.png'});
});

test('instructor has no subdomain catalog in navigation or API',async({page})=>{
  await login(page,'intervenant');await expect(page.getByRole('heading',{name:'Sous-domaines de compétences',exact:true})).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Sous-domaines',exact:true})).toHaveCount(0);
  expect((await page.request.get('/api/referentiels/sous-domaines')).status()).toBe(403);
});

test('manager creates edits and deactivates a subdomain while retaining its competencies',async({page})=>{
  await login(page);const csrf=await(await page.request.get('/api/auth/csrf')).json();const headers={[csrf.headerName]:csrf.token};
  const code=`SUBUI-${Date.now()}`;const label=`000-${code}`;
  const parentResponse=await page.request.post('/api/referentiels/domaines',{headers,data:{code,label:'Domaine de recette des sous-domaines'}});expect(parentResponse.status()).toBe(201);const parent=await parentResponse.json();
  const inactiveResponse=await page.request.post('/api/referentiels/domaines',{headers,data:{code:code+'-INACTIF',label:'Parent désactivé pour la recette'}});expect(inactiveResponse.status()).toBe(201);const inactive=await inactiveResponse.json();
  expect((await page.request.post(`/api/referentiels/domaines/${inactive.id}/desactivation`,{headers,data:{version:inactive.version}})).status()).toBe(204);
  const panel=page.getByRole('region',{name:'Sous-domaines de compétences',exact:true});await panel.getByRole('button',{name:'Actualiser les sous-domaines',exact:true}).click();
  await panel.getByLabel('Filtrer par domaine parent',{exact:true}).selectOption(parent.id);await expect(panel.getByText('Aucun sous-domaine.',{exact:true})).toBeVisible();
  const create=panel.getByRole('button',{name:'Créer un sous-domaine',exact:true});await create.click();
  const editor=page.getByRole('dialog',{name:'Créer un sous-domaine',exact:true});
  await expect(editor.getByLabel('Domaine parent',{exact:true})).toBeFocused();await expect(editor.getByLabel('Domaine parent',{exact:true})).toHaveValue(parent.id);
  await expect(editor.getByLabel('Domaine parent',{exact:true}).locator(`option[value="${inactive.id}"]`)).toBeDisabled();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await editor.screenshot({path:'test-results/subdomain-editor-desktop.png'});
  await page.setViewportSize({width:375,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await editor.screenshot({path:'test-results/subdomain-editor-mobile.png'});await page.setViewportSize({width:1440,height:900});
  await editor.getByLabel('Code',{exact:true}).fill(code);await editor.getByLabel('Libellé',{exact:true}).fill(label);
  const response=page.waitForResponse(r=>r.request().method()==='POST'&&r.url().endsWith('/api/referentiels/sous-domaines'));
  await editor.getByRole('button',{name:'Enregistrer le sous-domaine',exact:true}).click();const created=await(await response).json();
  await expect(panel.getByRole('status',{name:'État des sous-domaines'})).toHaveText('Sous-domaine enregistré.');await expect(panel.getByRole('heading')).toBeFocused();
  await create.click();await editor.getByLabel('Code',{exact:true}).fill(code.toLowerCase());await editor.getByLabel('Libellé',{exact:true}).fill('Doublon');await editor.getByRole('button',{name:'Enregistrer le sous-domaine',exact:true}).click();
  await expect(editor.getByRole('alert')).toContainText('déjà utilisé');await expect(editor.getByRole('alert')).toBeFocused();await expect(editor.getByLabel('Code',{exact:true})).toHaveAttribute('aria-invalid','true');
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await page.keyboard.press('Escape');await expect(create).toBeFocused();
  await panel.getByRole('button',{name:`Modifier ${label}`,exact:true}).click();const editing=page.getByRole('dialog',{name:'Modifier un sous-domaine',exact:true});
  await expect(editing.getByLabel('Domaine parent',{exact:true})).toHaveCount(0);await expect(editing.getByText(/Fixé à la création/)).toBeVisible();
  await editing.getByLabel('Code',{exact:true}).fill(code+'-B');await editing.getByLabel('Libellé',{exact:true}).fill(label+' modifié');await editing.getByRole('button',{name:'Enregistrer le sous-domaine',exact:true}).click();
  await expect(panel.getByRole('status',{name:'État des sous-domaines'})).toHaveText('Sous-domaine enregistré.');
  expect((await page.request.post(`/api/referentiels/sous-domaines/${created.id}/competences`,{headers,data:{label:'Compétence historique de recette'}})).status()).toBe(201);
  const row=panel.getByRole('row').filter({hasText:label+' modifié'});await row.getByText(`Compétences de ${label} modifié`,{exact:true}).click();await expect(row.getByText('Compétence historique de recette — Actif',{exact:true})).toBeVisible();
  const disable=row.getByRole('button',{name:`Désactiver ${label} modifié`,exact:true});await disable.click();const confirmation=page.getByRole('dialog',{name:'Désactiver un sous-domaine',exact:true});
  await expect(confirmation.getByRole('button',{name:'Annuler',exact:true})).toBeFocused();await page.keyboard.press('Escape');await expect(disable).toBeFocused();await disable.click();
  await confirmation.getByRole('button',{name:'Confirmer la désactivation du sous-domaine',exact:true}).click();await expect(panel.getByRole('status',{name:'État des sous-domaines'})).toContainText('Sous-domaine désactivé.');
  await expect(row.getByRole('cell',{name:'Désactivé',exact:true})).toBeVisible();await expect(disable).toBeDisabled();
  await row.getByText(`Compétences de ${label} modifié`,{exact:true}).click();await expect(row.getByText('Compétence historique de recette — Actif',{exact:true})).toBeVisible();
  await panel.getByLabel('Filtrer par domaine parent',{exact:true}).selectOption(inactive.id);await expect(panel.getByText('Aucun sous-domaine.',{exact:true})).toBeVisible();
  await create.click();await expect(editor.getByLabel('Domaine parent',{exact:true})).toHaveValue('');await page.keyboard.press('Escape');
});

test('subdomain stale edit can reload its current version',async({page})=>{
  await login(page);const csrf=await(await page.request.get('/api/auth/csrf')).json();const headers={[csrf.headerName]:csrf.token};const code=`STALE-SUB-${Date.now()}`;
  const parentResponse=await page.request.post('/api/referentiels/domaines',{headers,data:{code,label:'Parent concurrence'}});expect(parentResponse.status()).toBe(201);const parent=await parentResponse.json();
  const response=await page.request.post('/api/referentiels/sous-domaines',{headers,data:{domainId:parent.id,code,label:'Avant concurrence'}});expect(response.status()).toBe(201);const child=await response.json();
  const panel=page.getByRole('region',{name:'Sous-domaines de compétences',exact:true});await panel.getByRole('button',{name:'Actualiser les sous-domaines',exact:true}).click();await panel.getByLabel('Filtrer par domaine parent',{exact:true}).selectOption(parent.id);
  await panel.getByRole('button',{name:'Modifier Avant concurrence',exact:true}).click();const editor=page.getByRole('dialog',{name:'Modifier un sous-domaine',exact:true});
  expect((await page.request.put(`/api/referentiels/sous-domaines/${child.id}`,{headers,data:{code,label:'Modifié ailleurs',version:child.version}})).status()).toBe(204);
  await editor.getByLabel('Libellé',{exact:true}).fill('Modification locale');await editor.getByRole('button',{name:'Enregistrer le sous-domaine',exact:true}).click();
  await expect(editor.getByRole('alert')).toContainText('a été modifié');await expect(editor.getByRole('alert')).toBeFocused();await editor.getByRole('button',{name:'Recharger la fiche',exact:true}).click();
  await expect(editor.getByLabel('Libellé',{exact:true})).toHaveValue('Modifié ailleurs');await expect(editor.getByLabel('Code',{exact:true})).toBeFocused();await editor.getByLabel('Libellé',{exact:true}).fill('Après rechargement');
  await editor.getByRole('button',{name:'Enregistrer le sous-domaine',exact:true}).click();await expect(panel.getByRole('status',{name:'État des sous-domaines'})).toHaveText('Sous-domaine enregistré.');
});
