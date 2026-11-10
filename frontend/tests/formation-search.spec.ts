import { test,expect,type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function login(page:Page){
 await page.goto('/');await page.getByLabel('Identifiant',{exact:true}).fill('gestionnaire');await page.getByLabel('Mot de passe',{exact:true}).fill('Dev-only-2026!');await page.getByRole('button',{name:'Se connecter',exact:true}).click();await page.getByRole('heading',{name:'Sessions accessibles',exact:true}).waitFor();
 const csrf=await(await page.request.get('/api/auth/csrf')).json();return {[csrf.headerName]:csrf.token};
}
async function catalogue(page:Page){await page.getByRole('button',{name:'Formations',exact:true}).click();return page.getByRole('region',{name:'Formations',exact:true});}

test('catalogue searches by code and title and keeps sessionless and archived offers with their associations',async({page},testInfo)=>{
 const headers=await login(page);const tag=`FIND-${Date.now()}`;const title=`Atelier de recherche ${tag}`;
 const created=await page.request.post('/api/formations',{headers,data:{code:tag,title,description:'Description conservée de l’offre',objectives:'Objectifs de l’offre'}});expect(created.status()).toBe(201);const formation=await created.json();const root=`/api/formations/${formation.id}`;
 expect((await page.request.post(root+'/activation',{headers,data:{version:0}})).status()).toBe(204);
 const panel=await catalogue(page);const input=panel.getByRole('searchbox',{name:'Rechercher une formation par code ou intitulé',exact:true});await input.focus();await page.keyboard.type(tag.toLowerCase());await page.keyboard.press('Enter');
 const row=panel.getByRole('row').filter({hasText:tag});await expect(row).toHaveCount(1);await expect(panel.getByRole('status')).toHaveText('1 formation(s) trouvée(s).');await expect(row.getByRole('cell',{name:'Active',exact:true})).toBeVisible();await expect(row.getByText('Description conservée de l’offre',{exact:true})).toBeVisible();
 await row.locator('summary').focus();await page.keyboard.press('Enter');await expect(row.getByText('Aucune session pour cette formation.',{exact:true})).toBeVisible();
 const parent=await(await page.request.post('/api/referentiels/domaines/50000000-0000-0000-0000-000000000001/sous-domaines',{headers,data:{label:'Parent historique recherche'}})).json();
 const competency=await(await page.request.post('/api/referentiels/competences',{headers,data:{subdomainId:parent.id,code:tag,label:'Compétence historique recherche'}})).json();
 expect((await page.request.post(root+'/competences',{headers,data:{competencyId:competency.id}})).status()).toBe(201);
 expect((await page.request.post(root+'/archivage',{headers,data:{version:1}})).status()).toBe(204);
 expect((await page.request.post(`/api/referentiels/competences/${competency.id}/desactivation`,{headers,data:{version:0}})).status()).toBe(204);
 await input.fill(title.toUpperCase());await input.press('Enter');await expect(panel.getByRole('status')).toHaveText('1 formation(s) trouvée(s).');await expect(row.getByRole('cell',{name:'Archivée',exact:true})).toBeVisible();await expect(row.getByText('Description conservée de l’offre',{exact:true})).toBeVisible();
 const trigger=row.getByRole('button',{name:`Compétences de la formation : ${title}`,exact:true});await trigger.focus();await page.keyboard.press('Enter');const dialog=page.getByRole('dialog',{name:'Compétences de la formation',exact:true});await expect(dialog.getByRole('listitem')).toHaveText(`${tag} — Compétence historique recherche — Inactive`);await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 await page.setViewportSize({width:375,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await panel.screenshot({path:testInfo.outputPath('recherche-mobile.png')});
});

test('submitted search survives pagination and retry, resets to the first page, and reports empty results',async({page})=>{
 const headers=await login(page);const tag=`SEARCH-PAGE-${Date.now()}`;
 for(let i=0;i<11;i++)expect((await page.request.post('/api/formations',{headers,data:{code:`${tag}-${String(i).padStart(2,'0')}`,title:`Résultat ${tag} ${i}`}})).status()).toBe(201);
 const panel=await catalogue(page);const input=panel.getByRole('searchbox',{name:'Rechercher une formation par code ou intitulé',exact:true});await input.fill(tag);await input.press('Enter');await expect(panel.getByRole('status')).toHaveText('11 formation(s) trouvée(s).');
 await input.fill('Brouillon non soumis');await panel.getByRole('button',{name:'Formations suivantes',exact:true}).click();await expect(panel.getByText('Page 2',{exact:true})).toBeVisible();await expect(panel.getByRole('row')).toHaveCount(2);await expect(panel.getByRole('row').nth(1)).toContainText(`${tag}-10`);
 await page.route('**/api/formations?*',route=>route.abort());await panel.getByRole('button',{name:'Actualiser les formations',exact:true}).click();await expect(panel.getByRole('alert')).toContainText('indisponible');await page.unroute('**/api/formations?*');await panel.getByRole('button',{name:'Actualiser les formations',exact:true}).click();await expect(panel.getByRole('alert')).toHaveCount(0);await expect(panel.getByRole('row').nth(1)).toContainText(`${tag}-10`);
 await input.fill(`${tag}-00`);await input.press('Enter');await expect(panel.getByRole('row')).toHaveCount(2);await expect(panel.getByText('Page 2',{exact:true})).toHaveCount(0);await expect(panel.getByRole('row').nth(1)).toContainText(`${tag}-00`);
 await input.fill(`ABSENT-${tag}`);await input.press('Enter');await expect(panel.getByText('Aucune formation ne correspond à votre recherche.',{exact:true})).toBeVisible();await expect(panel.getByRole('table')).toHaveCount(0);await expect(panel.getByRole('status')).toHaveText('0 formation(s) trouvée(s).');expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 const clear=panel.getByRole('button',{name:'Effacer la recherche',exact:true});await clear.focus();await page.keyboard.press('Enter');await expect(input).toBeFocused();await expect(input).toHaveValue('');await expect(panel.getByRole('table')).toBeVisible();
 await input.focus();await page.keyboard.press('Tab');await expect(panel.getByRole('button',{name:'Rechercher les formations',exact:true})).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(input).toBeFocused();
});
