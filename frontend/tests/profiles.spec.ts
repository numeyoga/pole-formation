import { test,expect,type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function login(page:Page,user='gestionnaire'){
  await page.goto('/');await page.getByLabel('Identifiant',{exact:true}).fill(user);await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();await page.getByRole('heading',{name:'Sessions accessibles',exact:true}).waitFor();
}
async function headers(page:Page){const token=await(await page.request.get('/api/auth/csrf')).json();return {[token.headerName]:token.token};}
const code=()=>`000-PROF-${9999999999999-Date.now()}`;

test('manager creates, edits and deactivates a profile with keyboard focus and responsive table',async({page})=>{
  await login(page);
  await page.getByRole('button',{name:'Profils d’emploi',exact:true}).focus();await page.keyboard.press('Enter');
  await expect(page.getByRole('heading',{name:'Profils d’emploi',exact:true})).toBeFocused();
  const panel=page.getByRole('region',{name:'Profils d’emploi',exact:true});
  await panel.getByRole('button',{name:'Créer un profil',exact:true}).click();
  const editor=page.getByRole('dialog',{name:'Créer un profil',exact:true});
  await expect(editor.getByLabel('Code',{exact:true})).toBeFocused();
  await page.keyboard.press('Tab');await expect(editor.getByLabel('Libellé',{exact:true})).toBeFocused();
  await page.keyboard.press('Tab');await expect(editor.getByLabel('Description',{exact:true})).toBeFocused();
  await page.keyboard.press('Shift+Tab');await expect(editor.getByLabel('Libellé',{exact:true})).toBeFocused();
  await page.keyboard.press('Escape');await expect(panel.getByRole('button',{name:'Créer un profil',exact:true})).toBeFocused();
  await panel.getByRole('button',{name:'Créer un profil',exact:true}).click();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await editor.screenshot({path:'test-results/profile-editor-desktop.png'});
  await page.setViewportSize({width:375,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await editor.screenshot({path:'test-results/profile-editor-mobile.png'});
  await page.setViewportSize({width:1440,height:900});
  const initialCode=code();const label=`Profil recette ${initialCode}`;
  await editor.getByLabel('Description',{exact:true}).fill('Description du profil');
  await editor.getByLabel('Code',{exact:true}).fill(initialCode);await editor.getByLabel('Libellé',{exact:true}).fill(label);
  const response=page.waitForResponse(r=>r.request().method()==='POST'&&r.url().endsWith('/api/referentiels/profils-emploi'));
  await editor.getByRole('button',{name:'Enregistrer le profil',exact:true}).click();const created=await(await response).json();
  await expect(panel.getByRole('status',{name:'État des profils'})).toHaveText('Profil enregistré.');
  await expect(page.getByRole('heading',{name:'Profils d’emploi',exact:true})).toBeFocused();
  await panel.getByRole('button',{name:'Créer un profil',exact:true}).click();
  await editor.getByLabel('Code',{exact:true}).fill(initialCode.toLowerCase());await editor.getByLabel('Libellé',{exact:true}).fill('Doublon');
  await editor.getByRole('button',{name:'Enregistrer le profil',exact:true}).click();
  await expect(editor.getByRole('alert')).toContainText('déjà utilisé');await expect(editor.getByRole('alert')).toBeFocused();
  await expect(editor.getByLabel('Code',{exact:true})).toHaveAttribute('aria-invalid','true');
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');await expect(panel.getByRole('button',{name:'Créer un profil',exact:true})).toBeFocused();
  const token=await headers(page);const referenceCode=`REQ-UI-${Date.now()}`;
  const domainResponse=await page.request.post('/api/referentiels/domaines',{headers:token,data:{code:referenceCode,label:'Domaine du profil'}});expect(domainResponse.status()).toBe(201);const domain=await domainResponse.json();
  const parentResponse=await page.request.post('/api/referentiels/sous-domaines',{headers:token,data:{domainId:domain.id,code:referenceCode,label:'Sous-domaine du profil'}});expect(parentResponse.status()).toBe(201);const parent=await parentResponse.json();
  const competencyResponse=await page.request.post('/api/referentiels/competences',{headers:token,data:{subdomainId:parent.id,code:referenceCode,label:'Compétence historique du profil'}});expect(competencyResponse.status()).toBe(201);const competency=await competencyResponse.json();
  const requirement={competencyId:competency.id,classificationId:'60000000-0000-0000-0000-000000000001'};
  expect((await page.request.post(`/api/referentiels/profils-emploi/${created.id}/exigences`,{headers:token,data:requirement})).status()).toBe(201);
  await panel.getByRole('button',{name:`Modifier ${label}`,exact:true}).click();
  const editing=page.getByRole('dialog',{name:'Modifier un profil',exact:true});
  await expect(editing.getByLabel('Code',{exact:true})).toHaveValue(initialCode);
  await expect(editing.getByLabel('Description',{exact:true})).toHaveValue('Description du profil');
  await editing.getByLabel('Code',{exact:true}).fill(initialCode+'-B');await editing.getByLabel('Libellé',{exact:true}).fill(label+' modifié');
  await editing.getByRole('button',{name:'Enregistrer le profil',exact:true}).click();
  await expect(panel.getByRole('status',{name:'État des profils'})).toHaveText('Profil enregistré.');
  const row=panel.getByRole('row').filter({hasText:initialCode+'-B'});
  await row.getByText(`Exigences de ${label} modifié`,{exact:true}).click();
  await expect(row.getByText(/Compétence historique du profil — /)).toBeVisible();
  const disable=row.getByRole('button',{name:`Désactiver ${label} modifié`,exact:true});await disable.click();
  const confirmation=page.getByRole('dialog',{name:'Désactiver un profil',exact:true});
  await expect(confirmation.getByRole('button',{name:'Annuler',exact:true})).toBeFocused();await page.keyboard.press('Escape');await expect(disable).toBeFocused();
  await disable.click();await confirmation.getByRole('button',{name:'Confirmer la désactivation',exact:true}).click();
  await expect(panel.getByRole('status',{name:'État des profils'})).toContainText('Profil désactivé.');
  await expect(row.getByRole('cell',{name:'Désactivé',exact:true})).toBeVisible();
  await row.getByText(`Exigences de ${label} modifié`,{exact:true}).click();
  await expect(row.getByText(/Compétence historique du profil — /)).toBeVisible();
  const refused=await page.request.post(`/api/referentiels/profils-emploi/${created.id}/exigences`,{headers:token,data:requirement});
  expect(refused.status()).toBe(409);expect((await refused.json()).detail).toContain('profil d’emploi désactivé');
  await panel.screenshot({path:'test-results/profile-list-desktop.png'});
  await page.setViewportSize({width:375,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const table=panel.getByRole('region',{name:'Tableau des profils',exact:true});await table.focus();await page.keyboard.press('ArrowRight');
  await expect.poll(()=>table.evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});

test('stale edit is rejected and can reload the current version',async({page})=>{
  await login(page);const initialCode=code();const label=`Concurrence ${initialCode}`;
  const response=await page.request.post('/api/referentiels/profils-emploi',{headers:await headers(page),data:{code:initialCode,label}});expect(response.status()).toBe(201);const created=await response.json();
  const panel=page.getByRole('region',{name:'Profils d’emploi',exact:true});await panel.getByRole('button',{name:'Actualiser les profils',exact:true}).click();
  await panel.getByRole('button',{name:`Modifier ${label}`,exact:true}).click();const editor=page.getByRole('dialog',{name:'Modifier un profil',exact:true});
  expect((await page.request.put(`/api/referentiels/profils-emploi/${created.id}`,{headers:await headers(page),data:{code:initialCode,label:'Modifié par un autre gestionnaire',version:created.version}})).status()).toBe(204);
  await editor.getByLabel('Libellé',{exact:true}).fill('Modification locale');await editor.getByRole('button',{name:'Enregistrer le profil',exact:true}).click();
  await expect(editor.getByRole('alert')).toContainText('a été modifié');await expect(editor.getByRole('alert')).toBeFocused();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await editor.getByRole('button',{name:'Recharger la fiche',exact:true}).click();await expect(editor.getByLabel('Libellé',{exact:true})).toHaveValue('Modifié par un autre gestionnaire');
  await editor.getByLabel('Libellé',{exact:true}).fill('Modification après rechargement');await editor.getByRole('button',{name:'Enregistrer le profil',exact:true}).click();
  await expect(panel.getByRole('status',{name:'État des profils'})).toHaveText('Profil enregistré.');
});

test('instructor cannot manage profiles or see their management section',async({page})=>{
  await login(page,'intervenant');await expect(page.getByRole('heading',{name:'Profils d’emploi',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Profils d’emploi',exact:true})).toHaveCount(0);expect((await page.request.get('/api/referentiels/profils-emploi')).status()).toBe(403);
});

test('profile pagination and network retry keep the list usable',async({page})=>{
  await page.route('**/api/referentiels/profils-emploi?*',route=>route.abort());
  await login(page);const panel=page.getByRole('region',{name:'Profils d’emploi',exact:true});
  await expect(panel.getByRole('alert')).toHaveText('Le service est indisponible. Réessayez.');
  await page.unroute('**/api/referentiels/profils-emploi?*');
  const token=await headers(page);const prefix=`PAGE-${Date.now()}`;
  for(let index=0;index<11;index++)expect((await page.request.post('/api/referentiels/profils-emploi',{headers:token,data:{code:`${prefix}-${index}`,label:`Pagination ${index}`}})).status()).toBe(201);
  await panel.getByRole('button',{name:'Actualiser les profils',exact:true}).click();
  await expect(panel.getByRole('alert')).toHaveCount(0);await expect(panel.getByRole('row')).toHaveCount(11);
  const first=await panel.getByRole('row').nth(1).textContent();
  await panel.getByRole('button',{name:'Profils suivants',exact:true}).click();
  await expect(panel.getByText('Page 2',{exact:true})).toBeVisible();expect(await panel.getByRole('row').nth(1).textContent()).not.toBe(first);
  await panel.getByRole('button',{name:'Profils précédents',exact:true}).click();await expect(panel.getByText('Page 1',{exact:true})).toBeVisible();
});
