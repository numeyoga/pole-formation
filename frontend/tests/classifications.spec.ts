import { test,expect,type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function login(page:Page,user='admin'){
  await page.goto('/');await page.getByLabel('Identifiant',{exact:true}).fill(user);await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();await page.getByRole('heading',{name:'Sessions accessibles',exact:true}).waitFor();
}
async function headers(page:Page){const token=await(await page.request.get('/api/auth/csrf')).json();return {[token.headerName]:token.token};}
const code=()=>`000-CL-${9999999999999-Date.now()}`;
test('administrator configures classifications with keyboard focus, activation, duplicate feedback and axe',async({page})=>{
  await login(page);await page.getByRole('button',{name:'Classifications',exact:true}).focus();await page.keyboard.press('Enter');
  await expect(page.getByRole('heading',{name:'Classifications',exact:true})).toBeFocused();
  const panel=page.getByRole('region',{name:'Classifications',exact:true});
  await panel.getByRole('button',{name:'Créer une classification',exact:true}).click();
  const editor=page.getByRole('dialog');await expect(editor.getByLabel('Code',{exact:true})).toBeFocused();
  await page.keyboard.press('Tab');await expect(editor.getByLabel('Libellé',{exact:true})).toBeFocused();
  await page.keyboard.press('Tab');await expect(editor.getByLabel('Ordre',{exact:true})).toBeFocused();
  await page.keyboard.press('Escape');await expect(panel.getByRole('button',{name:'Créer une classification',exact:true})).toBeFocused();
  await panel.getByRole('button',{name:'Créer une classification',exact:true}).click();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  const value=code(),label=`Classification ${value}`;
  await editor.getByLabel('Code',{exact:true}).fill(value);await editor.getByLabel('Libellé',{exact:true}).fill(label);await editor.getByLabel('Ordre',{exact:true}).fill('0');
  await editor.getByRole('button',{name:'Enregistrer la classification',exact:true}).click();
  await expect(panel.getByRole('status')).toHaveText('Classification enregistrée.');
  await expect(page.getByRole('heading',{name:'Classifications',exact:true})).toBeFocused();
  await panel.getByRole('button',{name:`Modifier ${label}`,exact:true}).click();
  await expect(editor.getByLabel('Active',{exact:true})).toBeChecked();await editor.getByLabel('Active',{exact:true}).uncheck();
  await editor.getByRole('button',{name:'Enregistrer la classification',exact:true}).click();
  await expect(panel.getByRole('row').filter({hasText:label})).toContainText('Désactivé');
  await panel.getByRole('button',{name:'Créer une classification',exact:true}).click();
  await editor.getByLabel('Code',{exact:true}).fill(value.toLowerCase());await editor.getByLabel('Libellé',{exact:true}).fill('Doublon');
  await editor.getByRole('button',{name:'Enregistrer la classification',exact:true}).click();
  await expect(editor.getByRole('alert')).toBeFocused();await expect(editor.getByLabel('Code',{exact:true})).toHaveAttribute('aria-invalid','true');
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.setViewportSize({width:375,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await editor.screenshot({path:'test-results/classification-editor-mobile.png'});
  await page.keyboard.press('Escape');const table=panel.getByRole('region',{name:'Tableau des classifications',exact:true});await table.focus();await page.keyboard.press('ArrowRight');await expect.poll(()=>table.evaluate(e=>e.scrollLeft)).toBeGreaterThan(0);
});
test('concurrent classification edit can reload and save the current version',async({page})=>{
  await login(page);const value=code(),label=`Concurrence ${value}`,token=await headers(page);
  const created=await page.request.post('/api/referentiels/classifications',{headers:token,data:{code:value,label,sortOrder:0}});expect(created.status()).toBe(201);const item=await created.json();
  const panel=page.getByRole('region',{name:'Classifications',exact:true});await panel.getByRole('button',{name:'Actualiser les classifications',exact:true}).click();
  await panel.getByRole('button',{name:`Modifier ${label}`,exact:true}).click();
  expect((await page.request.put(`/api/referentiels/classifications/${item.id}`,{headers:token,data:{...item,label:'Version distante'}})).status()).toBe(204);
  const editor=page.getByRole('dialog');await editor.getByLabel('Libellé',{exact:true}).fill('Version locale');await editor.getByRole('button',{name:'Enregistrer la classification',exact:true}).click();
  await expect(editor.getByRole('alert')).toBeFocused();await expect(editor.getByRole('alert')).toContainText('a été modifiée');
  await editor.getByRole('button',{name:'Recharger la fiche',exact:true}).click();await expect(editor.getByLabel('Libellé',{exact:true})).toHaveValue('Version distante');
  await expect(editor.getByLabel('Code',{exact:true})).toBeFocused();await editor.getByRole('button',{name:'Enregistrer la classification',exact:true}).click();await expect(editor).not.toBeVisible();
});
for(const user of ['gestionnaire','intervenant'])test(`${user} cannot configure classifications`,async({page})=>{
  await login(page,user);await expect(page.getByRole('button',{name:'Classifications',exact:true})).toHaveCount(0);await expect(page.getByRole('heading',{name:'Classifications',exact:true})).toHaveCount(0);
  expect((await page.request.post('/api/referentiels/classifications',{headers:await headers(page),data:{code:'FORBIDDEN',label:'Interdit',sortOrder:0}})).status()).toBe(403);
});
test('classification list retries network failures and supports pagination',async({page})=>{
  await page.route('**/api/referentiels/classifications?*',r=>r.abort());await login(page);
  const panel=page.getByRole('region',{name:'Classifications',exact:true});await expect(panel.getByRole('alert')).toHaveText('Le service est indisponible. Réessayez.');
  await page.unroute('**/api/referentiels/classifications?*');const token=await headers(page),prefix=code();
  for(let i=0;i<11;i++)expect((await page.request.post('/api/referentiels/classifications',{headers:token,data:{code:`${prefix}-${i}`,label:`Pagination ${i}`,sortOrder:0}})).status()).toBe(201);
  await panel.getByRole('button',{name:'Actualiser les classifications',exact:true}).click();await expect(panel.getByRole('alert')).toHaveCount(0);
  await panel.getByRole('button',{name:'Classifications suivantes',exact:true}).click();await expect(panel.getByText('Page 2',{exact:true})).toBeVisible();
  await panel.getByRole('button',{name:'Classifications précédentes',exact:true}).click();await expect(panel.getByText('Page 1',{exact:true})).toBeVisible();
});
