import { test,expect,type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function login(page:Page,user='gestionnaire'){
  await page.goto('/');await page.getByLabel('Identifiant',{exact:true}).fill(user);await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();await page.getByRole('heading',{name:'Sessions accessibles',exact:true}).waitFor();
}
async function fixture(page:Page){
  const csrf=await(await page.request.get('/api/auth/csrf')).json();const headers={[csrf.headerName]:csrf.token};
  const code=`COMPUI-${Date.now()}`;
  const domainResponse=await page.request.post('/api/referentiels/domaines',{headers,data:{code,label:'Domaine de recette des compétences'}});expect(domainResponse.status()).toBe(201);const domain=await domainResponse.json();
  const parentResponse=await page.request.post('/api/referentiels/sous-domaines',{headers,data:{domainId:domain.id,code,label:'Parent de recette des compétences'}});expect(parentResponse.status()).toBe(201);const parent=await parentResponse.json();
  return {headers,code,parent};
}
test('manager creates edits and deactivates a competency using accessible native dialogs',async({page})=>{
  await login(page);const {headers,code,parent}=await fixture(page);
  const inactiveResponse=await page.request.post('/api/referentiels/sous-domaines',{headers,data:{domainId:parent.domainId,code:code+'-OFF',label:'Parent inactif'}});expect(inactiveResponse.status()).toBe(201);const inactive=await inactiveResponse.json();
  expect((await page.request.post(`/api/referentiels/sous-domaines/${inactive.id}/desactivation`,{headers,data:{version:0}})).status()).toBe(204);
  const panel=page.getByRole('region',{name:'Compétences du référentiel',exact:true});await panel.getByRole('button',{name:'Actualiser les compétences',exact:true}).click();
  await panel.getByLabel('Filtrer par sous-domaine parent',{exact:true}).selectOption(parent.id);await expect(panel.getByText('Aucune compétence.',{exact:true})).toBeVisible();
  const create=panel.getByRole('button',{name:'Créer une compétence',exact:true});await create.click();const editor=page.getByRole('dialog',{name:'Créer une compétence',exact:true});
  await expect(editor.getByLabel('Sous-domaine parent',{exact:true})).toBeFocused();await expect(editor.getByLabel('Sous-domaine parent',{exact:true})).toHaveValue(parent.id);
  await expect(editor.getByLabel('Sous-domaine parent',{exact:true}).locator(`option[value="${inactive.id}"]`)).toBeDisabled();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await editor.screenshot({path:'test-results/competency-editor-desktop.png'});
  await page.setViewportSize({width:375,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await editor.screenshot({path:'test-results/competency-editor-mobile.png'});await page.setViewportSize({width:1440,height:900});
  await editor.getByLabel('Code',{exact:true}).fill(code);await editor.getByLabel('Libellé',{exact:true}).fill('Compétence de recette');
  const response=page.waitForResponse(r=>r.request().method()==='POST'&&r.url().endsWith('/api/referentiels/competences'));
  await editor.getByRole('button',{name:'Enregistrer la compétence',exact:true}).click();const created=await(await response).json();
  await expect(panel.getByRole('status',{name:'État des compétences'})).toHaveText('Compétence enregistrée.');await expect(panel.getByRole('heading')).toBeFocused();
  await create.click();await editor.getByLabel('Code',{exact:true}).fill(code.toLowerCase());await editor.getByLabel('Libellé',{exact:true}).fill('Doublon');await editor.getByRole('button',{name:'Enregistrer la compétence',exact:true}).click();
  await expect(editor.getByRole('alert')).toContainText('déjà utilisé');await expect(editor.getByRole('alert')).toBeFocused();await expect(editor.getByLabel('Code',{exact:true})).toHaveAttribute('aria-invalid','true');
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await page.keyboard.press('Escape');await expect(create).toBeFocused();
  await panel.getByRole('button',{name:'Modifier Compétence de recette',exact:true}).click();const editing=page.getByRole('dialog',{name:'Modifier une compétence',exact:true});
  await expect(editing.getByLabel('Sous-domaine parent',{exact:true})).toHaveCount(0);await expect(editing.getByText(/Fixé à la création/)).toBeVisible();
  expect((await page.request.put(`/api/referentiels/competences/${created.id}`,{headers,data:{code,label:'Modifiée ailleurs',version:0}})).status()).toBe(204);
  await editing.getByLabel('Libellé',{exact:true}).fill('Écrasement local');await editing.getByRole('button',{name:'Enregistrer la compétence',exact:true}).click();
  await expect(editing.getByRole('alert')).toContainText('a été modifiée');await expect(editing.getByRole('alert')).toBeFocused();await editing.getByRole('button',{name:'Recharger la fiche',exact:true}).click();
  await expect(editing.getByLabel('Libellé',{exact:true})).toHaveValue('Modifiée ailleurs');await expect(editing.getByLabel('Code',{exact:true})).toBeFocused();
  await editing.getByLabel('Code',{exact:true}).fill(code+'-B');await editing.getByLabel('Libellé',{exact:true}).fill('Compétence modifiée');await editing.getByRole('button',{name:'Enregistrer la compétence',exact:true}).click();
  await expect(panel.getByRole('status',{name:'État des compétences'})).toHaveText('Compétence enregistrée.');
  const row=panel.getByRole('row').filter({hasText:'Compétence modifiée'});const disable=row.getByRole('button',{name:'Désactiver Compétence modifiée',exact:true});await disable.click();
  const confirmation=page.getByRole('dialog',{name:'Désactiver une compétence',exact:true});await expect(confirmation.getByRole('button',{name:'Annuler',exact:true})).toBeFocused();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await page.keyboard.press('Escape');await expect(disable).toBeFocused();await disable.click();
  await confirmation.getByRole('button',{name:'Confirmer la désactivation de la compétence',exact:true}).click();await expect(panel.getByRole('status',{name:'État des compétences'})).toContainText('Compétence désactivée.');
  await expect(row.getByRole('cell',{name:'Désactivé',exact:true})).toBeVisible();await expect(disable).toBeDisabled();await expect(panel.getByRole('heading')).toBeFocused();
  const history=await(await page.request.get(`/api/referentiels/sous-domaines/${parent.id}/competences`)).json();expect(history).toEqual(expect.arrayContaining([expect.objectContaining({id:created.id,label:'Compétence modifiée',active:false})]));
});

test('competency catalog supports retry filter pagination and keyboard scrolling with an inactive parent',async({page})=>{
  await page.route('**/api/referentiels/competences?*',route=>route.abort());await login(page);
  const panel=page.getByRole('region',{name:'Compétences du référentiel',exact:true});await expect(panel.getByRole('alert')).toHaveText('Le service est indisponible. Réessayez.');
  await page.unroute('**/api/referentiels/competences?*');const {headers,code,parent}=await fixture(page);
  for(let index=0;index<11;index++)expect((await page.request.post('/api/referentiels/competences',{headers,data:{subdomainId:parent.id,code:`${code}-${index}`,label:`Compétence ${String(index).padStart(2,'0')}`}})).status()).toBe(201);
  expect((await page.request.post(`/api/referentiels/sous-domaines/${parent.id}/desactivation`,{headers,data:{version:0}})).status()).toBe(204);
  await panel.getByRole('button',{name:'Actualiser les compétences',exact:true}).click();await expect(panel.getByRole('alert')).toHaveCount(0);
  await panel.getByLabel('Filtrer par sous-domaine parent',{exact:true}).selectOption(parent.id);await expect(panel.getByRole('row')).toHaveCount(11);
  await expect(panel.getByRole('row').nth(1)).toContainText('Compétence 00');await expect(panel.getByRole('row').nth(1).getByRole('cell',{name:'Désactivé',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Compétences',exact:true}).focus();await page.keyboard.press('Enter');await expect(panel.getByRole('heading')).toBeFocused();
  await panel.getByRole('button',{name:'Compétences suivantes',exact:true}).click();await expect(panel.getByText('Page 2',{exact:true})).toBeVisible();await expect(panel.getByRole('row').nth(1)).toContainText('Compétence 10');
  await panel.getByRole('button',{name:'Compétences précédentes',exact:true}).click();await expect(panel.getByRole('row').nth(1)).toContainText('Compétence 00');
  for(const width of [2048,1440,1024,375]){
    await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await panel.screenshot({path:`test-results/competencies-${width}.png`});
  }
  const table=panel.getByRole('region',{name:'Tableau des compétences',exact:true});await table.focus();await page.keyboard.press('ArrowRight');await expect.poll(()=>table.evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);
});

test('instructor cannot navigate to or query competencies',async({page})=>{
  await login(page,'intervenant');await expect(page.getByRole('heading',{name:'Compétences du référentiel',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Compétences',exact:true})).toHaveCount(0);
  expect((await page.request.get('/api/referentiels/competences')).status()).toBe(403);
});
